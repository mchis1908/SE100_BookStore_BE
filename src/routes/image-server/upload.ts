import { Request, Response, Router } from "express"
import upload from "../../service/image-upload"

const router = Router()

router.post("/upload", upload.single("image"), (req: Request, res: Response) => {
    try {
        return res.json({ image: (req as any).file.path })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error })
    }
})

export default router
