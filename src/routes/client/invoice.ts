import { Request, Response, Router } from "express"
import { SCHEMA_NAME } from "../../interface"
import verifyRole from "../../middleware/verifyRole"
import { Invoice } from "../../models"
import { PaginateOptions, Types } from "mongoose"

const router = Router()
const toId = Types.ObjectId

// GET INVOICES
router.get("/", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { page, limit, search_q, lastNDays, date } = req.query
        const options: PaginateOptions = {
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 10,
            populate: [
                {
                    path: "employee",
                    select: "name"
                },
                {
                    path: "customer",
                    select: "name"
                }
            ],
            sort: { createdAt: -1 }
        }

        const parseValueInt = parseInt(search_q as string)

        await Invoice.paginate(
            search_q && search_q !== "0"
                ? {
                      $or:
                          parseValueInt && !isNaN(parseValueInt)
                              ? [{ total: parseInt(search_q as string) }]
                              : [
                                    { "customer.name": { $regex: search_q as string, $options: "i" } },
                                    { "employee.name": { $regex: search_q as string, $options: "i" } },
                                    { "categories.name": { $regex: search_q as string, $options: "i" } }
                                ],
                      ...(lastNDays && {
                          createdAt: {
                              $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(lastNDays.toString())))
                          }
                      }),
                      ...(date && {
                          createdAt: {
                              $gte: new Date(new Date(date.toString()).setHours(0, 0, 0)),
                              $lte: new Date(new Date(date.toString()).setHours(23, 59, 59))
                          }
                      })
                  }
                : {
                      ...(lastNDays && {
                          createdAt: {
                              $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(lastNDays.toString())))
                          }
                      }),
                      ...(date && {
                          createdAt: {
                              $gte: new Date(new Date(date.toString()).setHours(0, 0, 0)),
                              $lte: new Date(new Date(date.toString()).setHours(23, 59, 59))
                          }
                      })
                  },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                return res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET CUSTOMER's INVOICES
router.get("/customer/:customer_id", verifyRole(), async (req: Request, res: Response) => {
    try {
        const { customer_id } = req.params
        const { lastNDays, date, page, limit, search_q } = req.query
        const options: PaginateOptions = {
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 10,
            populate: [
                {
                    path: "employee",
                    select: "name"
                }
            ],
            sort: { createdAt: -1 }
        }
        const parseValueInt = parseInt(search_q as string)

        await Invoice.paginate(
            search_q && search_q !== "0"
                ? {
                      $or:
                          parseValueInt && !isNaN(parseValueInt)
                              ? [{ total: parseInt(search_q as string) }]
                              : [
                                    { "customer.name": { $regex: search_q as string, $options: "i" } },
                                    { "employee.name": { $regex: search_q as string, $options: "i" } },
                                    { "categories.name": { $regex: search_q as string, $options: "i" } }
                                ],
                      ...(lastNDays && {
                          createdAt: {
                              $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(lastNDays.toString())))
                          }
                      }),
                      ...(date && {
                          createdAt: {
                              $gte: new Date(new Date(date.toString()).setHours(0, 0, 0)),
                              $lte: new Date(new Date(date.toString()).setHours(23, 59, 59))
                          }
                      }),
                      customer: customer_id
                  }
                : {
                      customer: customer_id,
                      ...(lastNDays && {
                          createdAt: {
                              $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(lastNDays.toString())))
                          }
                      }),
                      ...(date && {
                          createdAt: {
                              $gte: new Date(new Date(date.toString()).setHours(0, 0, 0)),
                              $lte: new Date(new Date(date.toString()).setHours(23, 59, 59))
                          }
                      })
                  },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                return res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET INVOICE BY ID
router.get("/:id", verifyRole(), async (req: Request, res: Response) => {
    try {
        const invoice = await Invoice.findById(req.params.id, undefined, {
            populate: [
                {
                    path: "employee",
                    select: "name"
                },
                {
                    path: "customer",
                    select: "name"
                },
                {
                    path: "invoiceDetails",
                    populate: {
                        path: "book",
                        select: "name author salesPrice"
                    }
                }
            ]
        })
        if (!invoice) {
            return res.status(404).json({ success: false, message: "invoice not found" })
        }

        res.json({ success: true, data: invoice })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})
export default router
