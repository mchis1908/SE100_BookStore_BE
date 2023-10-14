import { Request, Response, Router } from "express"
import { PaginateOptions } from "mongoose"
import verifyRole from "../../middleware/verifyRole"
import mustHaveFields from "../../middleware/must-have-field"
import { Voucher } from "../../models"

const router = Router()

// GET USED VOUCHERS
router.get("/used-vouchers", verifyRole(), async (req: Request, res: Response) => {
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
export default router
