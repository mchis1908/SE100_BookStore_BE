import { Request, Response, Router } from "express"
import verifyRole from "../../../middleware/verifyRole"
import Salary from "../../../models/common/Salary"
import { PaginateOptions } from "mongoose"
import { User } from "../../../models"

const router = Router()

// GET ALL SALARIES
router.get("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { page, limit, month, year } = req.query
        const options: PaginateOptions = {
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 10,
            populate: {
                path: "employee",
                select: "name email phoneNumber address user refPath",
                populate: {
                    path: "user",
                    select: "salary salaryScale",
                    populate: {
                        path: "salaryScale"
                    }
                }
            }
        }
        await Salary.paginate(
            {
                ...(month && { month: parseInt(month as string, 10) }),
                ...(year && { year: parseInt(year as string, 10) })
            },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                return res.status(200).json({ success: true, data: docs, ...rest })
            }
        )
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

// CREATE SALARY
router.post("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { employee } = req.body
        const _employee = await User.findById(employee)
        if (!_employee) return res.status(400).json({ success: false, message: "Employee does not exist" })
        const newSalary = await Salary.create({
            ...req.body
        })
        return res.status(200).json({ success: true, data: newSalary })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE SALARY
router.put("/:id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const updatedSalary = await Salary.findByIdAndUpdate(
            id,
            {
                $set: { ...req.body }
            },
            { new: true }
        )
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
