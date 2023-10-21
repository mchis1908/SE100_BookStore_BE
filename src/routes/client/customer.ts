import { Request, Response, Router } from "express"
import { PaginateOptions } from "mongoose"
import verifyRole from "../../middleware/verifyRole"
import mustHaveFields from "../../middleware/must-have-field"
import { Customer, User, Voucher } from "../../models"
import { ICustomer } from "../../interface"

const router = Router()

// GET USED VOUCHERS
router.get("/voucher/used", verifyRole(), async (req: Request, res: Response) => {
    try {
        const { page, limit } = req.query
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10
        }
        await Voucher.paginate(
            {
                customersUsed: { $in: [req.user_id] }
            },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET CUSTOMER'S VOUCHERS
router.get("/voucher", verifyRole(), async (req: Request, res: Response) => {
    try {
        const { page, limit, level } = req.query
        const options: PaginateOptions = {
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 10
        }
        const user = await User.findById(req.user_id).populate("user")
        if (!user) return res.status(400).json({ success: false, message: "Customer not found" })
        const customer = user.user as ICustomer
        if (level) {
            if (Number(level) > customer.level) {
                return res
                    .status(400)
                    .json({ success: false, message: "You cannot get vouchers with higher level than yours" })
            }
        }

        await Voucher.paginate(
            {
                level: Number(level) <= customer.level ? level : { $lte: customer.level || 1 }
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

export default router
