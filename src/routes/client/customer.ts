import { Request, Response, Router } from "express"
import { ProblemReport, Voucher } from "../../models"
import { PaginateOptions } from "mongoose"
import verifyRole from "../../middleware/verifyRole"
import { IProblemReport } from "../../interface"
import mustHaveFields from "../../middleware/must-have-field"

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

// SEND PROBLEM
router.post(
    "/send-problem",
    mustHaveFields<IProblemReport>("announcer", "description", "images", "reportingLocation", "title"),
    async (req: Request, res: Response) => {
        try {
            await ProblemReport.create({
                ...req.body
            })
            res.json({ success: true, message: "Problem sent successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

export default router
