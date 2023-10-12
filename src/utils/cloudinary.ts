import { configDotenv } from "dotenv"
import { CloudinaryStorage } from "multer-storage-cloudinary"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cloudinary = require("cloudinary").v2
configDotenv()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "BOOKSTORE",
        allowed_formats: ["jpg", "png", "jpeg"],
        unique_filename: true
    } as any
})

export default storage
