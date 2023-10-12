import { configDotenv } from "dotenv"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "cloudinary"

configDotenv()
const cloudinaryV2 = cloudinary.v2
cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

export { cloudinaryV2 as cloudinaryAPI }

const storage = new CloudinaryStorage({
    cloudinary: cloudinaryV2,
    params: {
        folder: "BOOKSTORE",
        allowed_formats: ["jpg", "png", "jpeg"],
        unique_filename: true
    } as any
})

export default storage
