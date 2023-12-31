import { Request, Response, Router } from "express"
import { Types } from "mongoose"
import { EUserRole, IExpense } from "../../../interface"
import { EExpenseStatus } from "../../../interface/expense/IExpense"
import mustHaveFields from "../../../middleware/must-have-field"
import doNotAllowFields from "../../../middleware/not-allow-field"
import verifyRole from "../../../middleware/verifyRole"
import { Expense, User } from "../../../models"

const router = Router()
const toId = Types.ObjectId

// CREATE NEW EXPENSE
router.post(
    "/create",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IExpense>("description", "subject"),
    doNotAllowFields<IExpense>("status", "statusUpdatedAt", "statusUpdatedBy"),
    async (req: Request, res: Response) => {
        try {
            const currentUser = await User.findById(req.user_id)
            if (!currentUser) return res.status(400).json({ success: false, message: "User not found" })
            let status = EExpenseStatus.PENDING
            if (currentUser.role === EUserRole.ADMIN) {
                status = EExpenseStatus.RESOLVED
            }

            const newExpense = await Expense.create({
                ...req.body,
                status,
                statusUpdatedAt: new Date(),
                statusUpdatedBy: req.user_id,
                reporter: req.user_id,
                subject: req.body.subject || "No subject"
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
    doNotAllowFields<IExpense>("cost", "description", "statusUpdatedAt", "statusUpdatedBy"),
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
        const { lastNDays, date, status, search_q } = req.query
        const statuses = status ? status.toString().split(",") : []
        const expenses = await Expense.find({
            ...(statuses.length > 0 && { status: { $in: statuses } }),
            ...(lastNDays && {
                createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - parseInt(lastNDays.toString()))) }
            }),
            ...(date && {
                createdAt: {
                    $gte: new Date(new Date(date.toString()).setHours(0, 0, 0)),
                    $lte: new Date(new Date(date.toString()).setHours(23, 59, 59))
                }
            }),
            ...(search_q && {
                $or: [{ description: { $regex: search_q.toString(), $options: "i" } }]
            })
        })
            .populate("reporter", "name")
            .populate("statusUpdatedBy", "name")
        res.json({ success: true, data: expenses })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
