import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"

const router = Router()

// GET SOLD BOOKS
router.get("/sold-books", verifyRole(["admin", "employee"]), (req: Request, res: Response) => {
    try {
        //
    } catch (error: any) {
        res.status(500).json({ message: error.message, success: false })
    }
})

export default router
