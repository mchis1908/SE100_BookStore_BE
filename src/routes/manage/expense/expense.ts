import { Request, Response, Router } from "express"
import { Types } from "mongoose"
import { EUserRole, IExpense } from "../../../interface"
import { EExpenseStatus } from "../../../interface/expense/IExpense"
import mustHaveFields from "../../../middleware/must-have-field"
import doNotAllowFields from "../../../middleware/not-allow-field"
import verifyRole from "../../../middleware/verifyRole"
import { Expense, ExpenseType, User } from "../../../models"

const router = Router()
const toId = Types.ObjectId

// CREATE NEW EXPENSE
router.post(
    "/create",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IExpense>("cost", "expenseType", "description"),
    doNotAllowFields<IExpense>("status", "statusUpdatedAt", "statusUpdatedBy"),
    async (req: Request, res: Response) => {
        try {
            const { expenseType } = req.body
            const currentUser = await User.findById(req.user_id)
            if (!currentUser) return res.status(400).json({ success: false, message: "User not found" })
            let status = EExpenseStatus.PENDING
            if (currentUser.role === EUserRole.ADMIN) {
                status = EExpenseStatus.RESOLVED
            }
            const _expenseType = await ExpenseType.findById(expenseType)
            if (!_expenseType) return res.status(400).json({ success: false, message: "Expense type not found" })
            const newExpense = await Expense.create({
                ...req.body,
                status,
                statusUpdatedAt: new Date(),
                statusUpdatedBy: req.user_id
            } as IExpense)

            res.status(201).json({ success: true, message: "Expense created successfully", data: newExpense })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// UPDATE EXPENSE STATUS
router.put(
    "/update-status/:expense_id",
    verifyRole(["admin"]),
    mustHaveFields("status"),
    doNotAllowFields<IExpense>("cost", "description", "expenseType", "statusUpdatedAt", "statusUpdatedBy"),
    async (req: Request, res: Response) => {
        try {
            const { expense_id } = req.params
            const { status } = req.body
            const _expense = await Expense.findById(expense_id)
            if (!_expense) return res.status(400).json({ success: false, message: "Expense not found" })
            _expense.status = status
            _expense.statusUpdatedAt = new Date()
            _expense.statusUpdatedBy = new toId(req.user_id)
            await _expense.save()
            res.json({ success: true, message: "Expense status updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// DELETE EXPENSE
router.delete("/:expense_id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { expense_id } = req.params
        const _expense = await Expense.findById(expense_id)
        if (!_expense) return res.status(400).json({ success: false, message: "Expense not found" })
        await _expense.deleteOne()
        res.json({ success: true, message: "Expense deleted successfully" })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE EXPENSE
router.put(
    "/:expense_id",
    verifyRole(["admin"]),
    doNotAllowFields<IExpense>("status", "statusUpdatedAt", "statusUpdatedBy"),
    async (req: Request, res: Response) => {
        try {
            const { expense_id } = req.params
            const _expense = await Expense.findById(expense_id)
            if (!_expense) return res.status(400).json({ success: false, message: "Expense not found" })
            await _expense.updateOne({
                $set: {
                    ...req.body
                }
            })
            res.json({ success: true, message: "Expense updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL EXPENSES
router.get("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { status } = req.query
        const expenses = await Expense.find({
            ...(status && { status })
        })
        res.json({ success: true, data: expenses })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
