import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!, {
            autoIndex: true
        })
        console.log("MongoDB Connected...")
    } catch (err: any) {
        console.error("DB ERR", err.message)
        process.exit(1)
    }
}

export { connectDB }
