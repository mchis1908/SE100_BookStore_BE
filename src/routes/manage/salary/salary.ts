import { Request, Response, Router } from "express"
import verifyRole from "../../../middleware/verifyRole"
import Salary from "../../../models/common/Salary"
import { PaginateOptions, Types } from "mongoose"
import { User } from "../../../models"
import { ISalary, SCHEMA_NAME } from "../../../interface"
import mustHaveFields from "../../../middleware/must-have-field"

const router = Router()
const toId = Types.ObjectId

// GET ALL SALARIES
router.get("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query

        const salaries = await Salary.aggregate([
            {
                $match: {
                    ...(month && { month: parseInt(month as string, 10) }),
                    ...(year && { year: parseInt(year as string, 10) })
                }
            },
            {
                $lookup: {
                    from: SCHEMA_NAME.USERS,
                    localField: "employee",
                    foreignField: "_id",
                    as: "employees",
                    pipeline: [
                        {
                            // populate employee
                            $lookup: {
                                from: SCHEMA_NAME.EMPLOYEES,
                                localField: "user",
                                foreignField: "_id",
                                as: "user",
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: SCHEMA_NAME.SALARY_SCALES,
                                            localField: "salaryScale",
                                            foreignField: "_id",
                                            as: "salaryScale"
                                        }
                                    },
                                    { $unwind: "$salaryScale" }
                                ]
                            }
                        },
                        { $unwind: "$user" }
                    ]
                }
            },
            { $unwind: "$employees" },
            {
                $group: {
                    _id: {
                        month: "$month",
                        year: "$year"
                    },
                    total: { $sum: "$total" },
                    employees: { $push: "$employees" }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: "$_id.month",
                    year: "$_id.year",
                    total: 1,
                    employees: 1
                }
            }
        ])
        res.status(200).json({ success: true, data: salaries })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET SALARY BY ID
router.get("/:id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const salary = await Salary.findById(id).populate({
            path: "employee",
            select: "name email phoneNumber address user refPath",
            populate: {
                path: "user",
                select: "salary salaryScale",
                populate: {
                    path: "salaryScale"
                }
            }
        })
        if (!salary) return res.status(400).json({ success: false, message: "Salary does not exist" })
        return res.status(200).json({ success: true, data: salary })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// {
//     month: "",
//     year: "",
//     forceWorkingDays: "",
//     employees: [{
//         _id: "",
//         workingDays: "",
//         total: ""
//     }]
// }

interface IBody {
    month: string
    year: string
    forceWorkingDays: string
    employees: Pick<ISalary, "employee" | "total" | "workingDays">[]
}

// CREATE SALARY
router.post("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { month, year, forceWorkingDays, employees } = req.body as IBody
        const failedEmployees = [] as string[]
        const promiseCreateSalary = [] as Promise<any>[]
        for (const employee of employees) {
            const _employee = await User.findById(employee.employee)
            if (!_employee) {
                failedEmployees.push(employee.employee.toString())
            } else {
                const newSalary = Salary.create({
                    month,
                    year,
                    forceWorkingDays,
                    employee: new toId(employee.employee.toString()),
                    total: employee.total,
                    workingDays: employee.workingDays
                })
                promiseCreateSalary.push(newSalary)
            }
        }
        await Promise.all(promiseCreateSalary)
        return res.status(200).json({
            success: true,
            message:
                failedEmployees.length > 0 ? `Some employees cannot be completed: ${failedEmployees.join(", ")}` : "OK"
        })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE SALARY
router.put("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { month, year, forceWorkingDays, employees } = req.body as IBody
        const failedEmployees = [] as string[]
        const promiseUpdateSalary = [] as Promise<any>[]
        for (const employee of employees) {
            const _employee = await User.findById(employee.employee)
            if (!_employee) {
                failedEmployees.push(employee.employee.toString())
            } else {
                const newSalary = Salary.updateMany(
                    {
                        month,
                        year,
                        employee: new toId(employee.employee.toString())
                    },
                    {
                        $set: {
                            month,
                            year,
                            forceWorkingDays,
                            ...employee
                        }
                    }
                )
                promiseUpdateSalary.push(newSalary)
            }
        }
        await Promise.all(promiseUpdateSalary)
        return res.status(200).json({
            success: true,
            message:
                failedEmployees.length > 0 ? `Some employees cannot be completed: ${failedEmployees.join(", ")}` : "OK"
        })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE SALARY BY MONTH AND YEAR
router.put("/month-year", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { month, year } = req.body
        const updatedSalary = await Salary.updateMany(
            { month: parseInt(month, 10), year: parseInt(year, 10) },
            {
                $set: { ...req.body }
            },
            { new: true }
        )
        if (!updatedSalary) return res.status(400).json({ success: false, message: "Salary does not exist" })
        return res.status(200).json({ success: true, data: updatedSalary })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// DELETE SALARY
router.delete("/:id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const deletedSalary = await Salary.findByIdAndDelete(id)
        return res.status(200).json({ success: true, data: deletedSalary })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
