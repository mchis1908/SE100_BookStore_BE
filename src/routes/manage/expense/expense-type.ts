import { Request, Response, Router } from "express"
import verifyRole from "../../../middleware/verifyRole"
import mustHaveFields from "../../../middleware/must-have-field"
import { IExpenseType } from "../../../interface"
import { ExpenseType } from "../../../models"

const router = Router()

// CREATE NEW EXPENSE TYPE
router.post(
    "/create",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IExpenseType>("name"),
    async (req: Request, res: Response) => {
        try {
            const newExpenseType = await ExpenseType.create({
                ...req.body
            })
            res.status(201).json({ success: true, message: "Expense type created successfully", data: newExpenseType })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL EXPENSE TYPES
router.get("/type", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const expenseTypes = await ExpenseType.find()
        res.json({ success: true, data: expenseTypes })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE EXPENSE TYPE
router.put("/:type_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { type_id } = req.params
        if (!type_id) return res.status(400).json({ success: false, message: "Missing expense type id" })
        const updatedExpenseType = await ExpenseType.findByIdAndUpdate(
            type_id,
            {
                ...req.body
            },
            { new: true }
        )
        if (!updatedExpenseType) return res.status(400).json({ success: false, message: "Expense type not found" })
        res.json({ success: true, message: "Expense type updated successfully", data: updatedExpenseType })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// DELETE EXPENSE TYPE
router.delete("/:type_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { type_id } = req.params
        if (!type_id) return res.status(400).json({ success: false, message: "Missing expense type id" })
        const deletedExpenseType = await ExpenseType.findByIdAndDelete(type_id)
        if (!deletedExpenseType) return res.status(400).json({ success: false, message: "Expense type not found" })
        res.json({ success: true, message: "Expense type deleted successfully", data: deletedExpenseType })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
