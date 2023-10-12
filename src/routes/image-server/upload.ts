import { Request, Response, Router } from "express"
import upload from "../../service/image-upload"
import { cloudinaryAPI } from "../../utils/cloudinary"

const router = Router()

router.post("/upload", upload.single("image"), (req: Request, res: Response) => {
    try {
        return res.json({ image: (req as any).file.path })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

router.delete("/delete", async (req: Request, res: Response) => {
    try {
        const { image } = req.body
        const res = await cloudinaryAPI.uploader.destroy(image as string)
        return res.json({ success: true, message: "Image deleted successfully", data: res.result })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
