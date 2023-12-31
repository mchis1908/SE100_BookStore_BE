import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import { Book, Expense, Invoice, InvoiceDetail } from "../../models"
import { PipelineStage } from "mongoose"
import { SCHEMA_NAME } from "../../interface"
import { EExpenseStatus } from "../../interface/expense/IExpense"
import Salary from "../../models/common/Salary"
import moment from "moment"

const router = Router()

// GET SOLD BOOKS
router.get("/sold-books", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { lastNDays, lastNMonths, byCategory, byCount } = req.query as {
            lastNDays?: number
            lastNMonths?: number
            byCategory?: boolean
            byCount?: boolean
        }
        const lastNDaysTime = (lastNDays || 7) * 24 * 60 * 60 * 1000
        const lastNMonthsTime = (lastNMonths || 12) * 30 * 24 * 60 * 60 * 1000

        const data = await Invoice.aggregate([
            {
                $match: {
                    createdAt: !lastNMonths
                        ? {
                              $gte: new Date(Date.now() - lastNDaysTime)
                          }
                        : {
                              $gte: new Date(Date.now() - lastNMonthsTime)
                          }
                }
            },
            {
                $project: {
                    total: 1,
                    invoiceDetails: 1,
                    createdAt: 1
                }
            },
            {
                $lookup: {
                    from: SCHEMA_NAME.INVOICE_DETAILS,
                    localField: "invoiceDetails",
                    foreignField: "_id",
                    as: "invoiceDetails",
                    let: {
                        qquantity: "$invoiceDetails.quantity"
                    },
                    pipeline: [
                        {
                            $project: {
                                book: 1,
                                quantity: 1
                            }
                        },
                        {
                            $lookup: {
                                from: SCHEMA_NAME.BOOKS,
                                localField: "book",
                                foreignField: "_id",
                                as: "book",
                                pipeline: [
                                    {
                                        $project: {
                                            categories: 1
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            byCount || byCategory
                ? { $unwind: "$invoiceDetails" }
                : {
                      $project: {
                          quantity: 0
                      }
                  },
            {
                $lookup: {
                    from: SCHEMA_NAME.BOOK_CATEGORIES,
                    localField: "invoiceDetails.book.categories",
                    foreignField: "_id",
                    as: "invoiceDetails.book.categories",
                    pipeline: [
                        {
                            $project: {
                                name: 1
                            }
                        }
                    ]
                }
            },
            byCategory
                ? { $unwind: "$invoiceDetails.book.categories" }
                : {
                      $project: {
                          quantity: 0
                      }
                  },
            {
                $group: !byCategory
                    ? {
                          _id: lastNMonths
                              ? { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
                              : { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                          value: !byCount
                              ? {
                                    $sum: "$total"
                                }
                              : { $sum: "$invoiceDetails.quantity" }
                      }
                    : {
                          _id: "$invoiceDetails.book.categories.name",
                          value: { $sum: "$invoiceDetails.quantity" }
                      }
            },
            {
                $project: {
                    _id: 0,
                    [byCategory ? "category" : "time"]: "$_id",
                    value: 1
                }
            },
            {
                $sort: {
                    [byCategory ? "category" : "time"]: 1
                }
            }
        ])
        res.json({ data, success: true })
    } catch (error: any) {
        res.status(500).json({ message: error.message, success: false })
    }
})

// GET TOP 10 SELLING BOOKS
router.get("/top-10", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const data = await Book.aggregate([
            {
                $lookup: {
                    from: SCHEMA_NAME.INVOICE_DETAILS,
                    let: {
                        id: "$_id"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$$id", "$book"]
                                }
                            }
                        }
                    ],
                    as: "d"
                }
            },
            {
                $unwind: {
                    path: "$d",
                    preserveNullAndEmptyArrays: false
                }
            },
            {
                $group: {
                    _id: "$name",
                    totalQuantity: {
                        $sum: "$d.quantity"
                    }
                }
            },
            {
                $sort: {
                    totalQuantity: -1
                }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    name: "$_id",
                    _id: 0,
                    totalQuantity: 1
                }
            }
        ])
        return res.json({ data, success: true })
    } catch (error: any) {
        return res.status(500).json({ message: error.message, success: false })
    }
})

// REVENUE
router.get("/revenue", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { lastNMonths } = req.query as {
            lastNMonths?: number
        }

        const lastNMonthsTime = (lastNMonths || 12) * 30 * 24 * 60 * 60 * 1000
        const last = lastNMonthsTime

        const prevLastNMonthsTime = lastNMonthsTime * 2
        const prevLast = prevLastNMonthsTime

        const invoiceRevenue = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - last) }
                }
            },
            {
                $group: {
                    _id: null,
                    sellingRevenue: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const prevInvoiceRevenue = await Invoice.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - prevLast), $lte: new Date(Date.now() - last) }
                }
            },
            {
                $group: {
                    _id: null,
                    prevSellingRevenue: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const expenseRevenue = await Expense.aggregate([
            {
                $match: {
                    updatedAt: { $gte: new Date(Date.now() - last) },
                    status: EExpenseStatus.RESOLVED
                }
            },
            {
                $group: {
                    _id: null,
                    expenseCost: { $sum: "$cost" }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const prevExpenseRevenue = await Expense.aggregate([
            {
                $match: {
                    updatedAt: { $gte: new Date(Date.now() - prevLast), $lte: new Date(Date.now() - last) },
                    status: EExpenseStatus.RESOLVED
                }
            },
            {
                $group: {
                    _id: null,
                    prevExpenseCost: { $sum: "$cost" }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const salaryRevenue = await Salary.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - last) }
                }
            },
            {
                $group: {
                    _id: null,
                    employeeSalary: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const prevSalaryRevenue = await Salary.aggregate([
            {
                $match: {
                    createdAt: { $gte: new Date(Date.now() - prevLast), $lte: new Date(Date.now() - last) }
                }
            },
            {
                $group: {
                    _id: null,
                    prevEmployeeSalary: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0
                }
            }
        ])

        const ir = invoiceRevenue[0] === undefined ? null : invoiceRevenue[0]
        const pir = prevInvoiceRevenue[0] === undefined ? null : prevInvoiceRevenue[0]
        const er = expenseRevenue[0] === undefined ? null : expenseRevenue[0]
        const per = prevExpenseRevenue[0] === undefined ? null : prevExpenseRevenue[0]
        const sr = salaryRevenue[0] === undefined ? null : salaryRevenue[0]
        const psr = prevSalaryRevenue[0] === undefined ? null : prevSalaryRevenue[0]

        const irValue = ir?.sellingRevenue ?? 0
        const pirValue = pir?.prevSellingRevenue ?? 0
        const erValue = er?.expenseCost ?? 0
        const perValue = per?.prevExpenseCost ?? 0
        const srValue = sr?.employeeSalary ?? 0
        const psrValue = psr?.prevEmployeeSalary ?? 0

        const total = irValue - erValue - srValue
        const prevTotal = pirValue - perValue - psrValue

        const output = {
            selling: {
                current: irValue,
                prev: pirValue,
                difference: irValue / (pirValue || 1)
            },
            expense: {
                current: erValue,
                prev: perValue,
                difference: erValue / (perValue || 1)
            },
            salary: {
                current: srValue,
                prev: psrValue,
                difference: srValue / (psrValue || 1)
            },
            total: {
                current: total,
                prev: prevTotal,
                difference: total / (prevTotal || 1)
            }
        }
        res.json({ data: output, success: true })
    } catch (error: any) {
        res.status(500).json({ message: error.message, success: false })
    }
})

// SALARY
router.get("/salary", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query
        const _month = Number(month || new Date().getMonth())
        console.log({ _month })
        const _year = Number(year || new Date().getFullYear())
        const prevMonth = _month - 1 === 0 ? 12 : _month - 1
        const prevYear = _month - 1 === 0 ? _year - 1 : _year

        const currSalary = await Salary.aggregate([
            {
                $match: { month: { $eq: _month }, year: { $eq: _year } }
            },
            {
                $group: {
                    _id: null,
                    current: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    current: 1,
                    time: "$_id"
                }
            }
        ])

        const prevSalary = await Salary.aggregate([
            {
                $match: { month: { $eq: prevMonth }, year: { $eq: prevYear } }
            },
            {
                $group: {
                    _id: null,
                    prev: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    prev: 1
                }
            }
        ])

        const employees = await Salary.find(
            {
                month: { $eq: _month },
                year: { $eq: _year }
            },
            undefined,
            {
                select: "employee workingDays total forceWorkingDays",
                populate: {
                    path: "employee",
                    select: "name email phoneNumber user refPath",
                    populate: {
                        path: "user",
                        select: "salary salaryScale",
                        populate: {
                            path: "salaryScale",
                            select: "coefficient index"
                        }
                    }
                }
            }
        )

        const time = `${_year}-${_month.toString().length === 2 ? "" : 0}${_month}`
        const curr = currSalary[0] === undefined ? { current: 0 } : currSalary[0]
        const prev = prevSalary[0] === undefined ? { prev: 0 } : prevSalary[0]
        const difference = curr.current / (prev.prev || 1)
        const output = { ...curr, ...prev, difference, time, salary: employees }
        return res.json({ data: output, success: true })
    } catch (error: any) {
        return res.status(500).json({ message: error.message, success: false })
    }
})

// EXPENSE
router.get("/expense", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query
        const _month = Number(month || new Date().getMonth())
        const _year = Number(year || new Date().getFullYear())
        const prevMonth = _month - 1 === 0 ? 12 : _month - 1
        const prevYear = _month - 1 === 0 ? _year - 1 : _year

        const currSalary = await Expense.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$updatedAt" }, _month] },
                            { $eq: [{ $year: "$updatedAt" }, _year] },
                            { $eq: ["$status", EExpenseStatus.RESOLVED] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    current: { $sum: "$cost" }
                }
            },
            {
                $project: {
                    _id: 0,
                    current: 1,
                    time: "$_id"
                }
            }
        ])

        const prevSalary = await Expense.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$updatedAt" }, prevMonth] },
                            { $eq: [{ $year: "$updatedAt" }, prevYear] },
                            { $eq: ["$status", EExpenseStatus.RESOLVED] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    prev: { $sum: "$cost" }
                }
            },
            {
                $project: {
                    _id: 0,
                    prev: 1
                }
            }
        ])

        const time = `${_year}-${_month.toString().length === 2 ? "" : 0}${_month}`
        const curr = currSalary[0] === undefined ? { current: 0 } : currSalary[0]
        const prev = prevSalary[0] === undefined ? { prev: 0 } : prevSalary[0]
        const difference = curr.current / (prev.prev || 1)

        const output = { ...curr, ...prev, difference, time }
        return res.json({ data: output, success: true })
    } catch (error: any) {
        return res.status(500).json({ message: error.message, success: false })
    }
})

// SELLING BOOKS
router.get("/selling", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query
        const _month = Number(month || new Date().getMonth())
        const _year = Number(year || new Date().getFullYear())
        const prevMonth = _month - 1 === 0 ? 12 : _month - 1
        const prevYear = _month - 1 === 0 ? _year - 1 : _year

        const currSalary = await Invoice.aggregate([
            {
                $lookup: {
                    from: SCHEMA_NAME.INVOICE_DETAILS,
                    localField: "invoiceDetails",
                    foreignField: "_id",
                    as: "invoiceDetails"
                }
            },
            // { $unwind: "$invoice" },
            {
                $match: {
                    $expr: {
                        $and: [{ $eq: [{ $month: "$createdAt" }, _month] }, { $eq: [{ $year: "$createdAt" }, _year] }]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    current: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    current: 1,
                    time: "$_id"
                }
            }
        ])

        const prevSalary = await Invoice.aggregate([
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $month: "$createdAt" }, prevMonth] },
                            { $eq: [{ $year: "$createdAt" }, prevYear] }
                        ]
                    }
                }
            },
            {
                $lookup: {
                    from: SCHEMA_NAME.INVOICE_DETAILS,
                    localField: "invoiceDetails",
                    foreignField: "_id",
                    as: "invoiceDetails"
                }
            },
            // { $unwind: "$invoice" },
            {
                $group: {
                    _id: null,
                    prev: { $sum: "$total" }
                }
            },
            {
                $project: {
                    _id: 0,
                    prev: 1,
                    time: "$_id"
                }
            }
        ])

        const time = `${_year}-${_month.toString().length === 2 ? "" : 0}${_month}`
        const curr = currSalary[0] === undefined ? { current: 0 } : currSalary[0]
        const prev = prevSalary[0] === undefined ? { prev: 0 } : prevSalary[0]
        const difference = curr.current / (prev.prev || 1) || 0

        const output = { ...curr, ...prev, difference, time }
        return res.json({ data: output, success: true })
    } catch (error: any) {
        return res.status(500).json({ message: error.message, success: false })
    }
})

export default router
