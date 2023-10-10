import { Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import { PaginateOptions } from "mongoose"
import { Book, User } from "../../models"
import { EUserRole } from "../../interface"

const router = Router()

// GET TRASH BY TYPE
router.get("/", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const { type, page, limit } = req.query

        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10
        }

        if (!type) return res.status(400).json({ success: false, message: "Missing type" })
        switch (type) {
            case EUserRole.CUSTOMER:
            case EUserRole.EMPLOYEE:
                await User.paginate({ isDeleted: true, role: type }, options, (err, result) => {
                    if (err) return res.status(500).json({ success: false, message: err.message })
                    const { docs, ...rest } = result
                    res.json({ success: true, data: docs, ...rest })
                })
                break
            case "book":
                await Book.paginate({ isDeleted: true }, options, (err, result) => {
                    if (err) return res.status(500).json({ success: false, message: err.message })
                    const { docs, ...rest } = result
                    res.json({ success: true, data: docs, ...rest })
                })
                break
            default:
                return res.status(400).json({ success: false, message: "Invalid type" })
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// MOVE TO TRASH BY TYPE
router.put("/move", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const { type, object_id } = req.query
        if (!type) return res.status(400).json({ success: false, message: "Missing type" })
        switch (type) {
            case EUserRole.CUSTOMER:
            case EUserRole.EMPLOYEE:
                await User.updateMany({ _id: object_id }, { $set: { isDeleted: true } })
                res.json({ success: true, message: "Moved to trash successfully" })
                break
            case "book":
                await Book.updateMany({ _id: object_id }, { $set: { isDeleted: true } })
                res.json({ success: true, message: "Moved to trash successfully" })
                break
            default:
                return res.status(400).json({ success: false, message: "Invalid type" })
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// RESTORE BY TYPE
router.put("/restore", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const { type, object_id } = req.query
        if (!type) return res.status(400).json({ success: false, message: "Missing type" })
        switch (type) {
            case EUserRole.CUSTOMER:
            case EUserRole.EMPLOYEE:
                await User.updateMany({ _id: object_id }, { $set: { isDeleted: false } })
                res.json({ success: true, message: "Restored successfully" })
                break
            case "book":
                await Book.updateMany({ _id: object_id }, { $set: { isDeleted: false } })
                res.json({ success: true, message: "Restored successfully" })
                break
            default:
                return res.status(400).json({ success: false, message: "Invalid type" })
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// RESTORE ALL
router.put("/restore-all", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        await User.updateMany({ isDeleted: true }, { $set: { isDeleted: false } })
        await Book.updateMany({ isDeleted: true }, { $set: { isDeleted: false } })
        res.json({ success: true, message: "Restored successfully" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// REMOVE ALL
router.delete("/remove-all", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        await User.deleteMany({ isDeleted: true })
        await Book.deleteMany({ isDeleted: true })
        res.json({ success: true, message: "Removed successfully" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
