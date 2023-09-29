import bcrypt from "bcryptjs"
import express, { Request, Response } from "express"
import { Types } from "mongoose"
import { IUser } from "../interface"
import mustHaveFields from "../middleware/must-have-field"
import doNotAllowFields from "../middleware/not-allow-field"
import verifyRole from "../middleware/verifyRole"
import { User } from "../models"
import Credential from "../models/common/Credential"

const router = express.Router()
const toId = Types.ObjectId

// GET CURRENT USER
router.get("/", verifyRole(), async (req: Request, res: Response) => {
    try {
        const user = await User.findById(new toId(req.user_id)).populate("user")

        if (!user) return res.status(400).json({ success: false, message: "User not found" })
        res.json({ success: true, data: user })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE CURRENT USER
router.put("/", verifyRole(), doNotAllowFields<IUser>("role"), async (req: Request, res: Response) => {
    try {
        const user = await User.findById(new toId(req.user_id))
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }
        const update = {
            ...user.toJSON(),
            ...req.body
        }
        await user.updateOne(update, {
            new: true
        })
        res.json({ success: true, message: "User updated", data: update })
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message })
    }
})

// CHANGE PASSWORD
router.put(
    "/change-password",
    verifyRole(),
    mustHaveFields("oldPassword", "newPassword"),
    async (req: Request, res: Response) => {
        try {
            const { oldPassword, newPassword } = req.body
            const user = await User.findById(new toId(req.user_id))
            if (!user) {
                return res.status(400).json({ success: false, message: "User does not exist" })
            }

            const credential = await Credential.findOne({ user_id: user._id })
            if (!credential) {
                return res.status(400).json({ success: false, message: "User does not exist" })
            }

            const isMatch = await bcrypt.compare(oldPassword, credential.password)
            if (!isMatch) {
                return res.status(400).json({ success: false, message: "Incorrect old password" })
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10)
            credential.password = hashedPassword

            await credential.save()

            res.json({ success: true, message: "Success" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

export default router
