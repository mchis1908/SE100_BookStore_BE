import bcrypt from "bcryptjs"
import express, { Request, Response } from "express"
import jwt from "jsonwebtoken"
import { EUserRole, IUser, SCHEMA_NAME } from "../interface"
import mustHaveFields from "../middleware/must-have-field"
import doNotAllowFields from "../middleware/not-allow-field"
import { User } from "../models"
import Credential from "../models/common/Credential"
import { resetPassword, sendVerifyEmail } from "../template/mail"

const router = express.Router()

router.post(
    "/signup",
    doNotAllowFields<IUser>("refPath", "user", "role"),
    mustHaveFields<IUser>("email", "phoneNumber", "name", "password"),
    async (req: Request, res: Response) => {
        const { email, password, phoneNumber } = req.body as IUser
        try {
            const user = await User.findOne({ $or: [{ email }, { phoneNumber }] })
            if (user) return res.status(400).json({ success: false, message: "User already exists" })

            const newUser = new User({
                ...req.body,
                refPath: SCHEMA_NAME.ADMINS,
                role: EUserRole.ADMIN
            })

            await newUser.save()

            const bcryptPassword = await bcrypt.hash(password, 10)
            const newCredential = new Credential({
                user_id: newUser._id,
                password: bcryptPassword
            })
            await newCredential.save()

            const accessToken = jwt.sign({ user_id: newUser._id.toString() }, process.env.JWT_SECRET!, {
                expiresIn: "1y"
            })
            res.json({
                success: true,
                message: "Admin created",
                accessToken,
                data: newUser
            })
        } catch (err: any) {
            res.status(500).json({ success: false, message: err.message })
        }
    }
)

router.post("/signin", mustHaveFields("emailOrPhoneNumber", "password"), async (req, res) => {
    const { emailOrPhoneNumber, password } = req.body
    try {
        const user = await User.findOne({ $or: [{ email: emailOrPhoneNumber }, { phoneNumber: emailOrPhoneNumber }] })
        if (!user) return res.status(400).json({ success: false, message: "User does not exist" })

        const credential = await Credential.findOne({
            user_id: user._id
        })

        if (!credential) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }

        const isMatch = await bcrypt.compare(password, credential.password)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Wrong password" })
        }

        const accessToken = jwt.sign({ user_id: user._id.toString() }, process.env.JWT_SECRET!, { expiresIn: "1y" })
        res.json({
            success: true,
            message: "User logged in",
            accessToken,
            data: user
        })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
    try {
        const { emailOrPhoneNumber } = req.body
        console.log({ emailOrPhoneNumber })

        const user = await User.findOne({ $or: [{ email: emailOrPhoneNumber }, { phoneNumber: emailOrPhoneNumber }] })
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }

        if (!user.isEmailVerified) {
            return res.status(400).json({ success: false, message: "Email is not verified" })
        }

        const credential = await Credential.findOne({ user_id: user._id })
        if (!credential) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }
        const randomPassword = Math.random().toString(36).slice(-8)

        const hashedPassword = await bcrypt.hash(randomPassword, 10)
        credential.password = hashedPassword

        await credential.save()

        resetPassword({ email: user.email, resetPassword: randomPassword })

        res.send({ success: true, message: `Reset password has been sent to ${user.email}. Check it!` })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// SEND VERIFY EMAIL
router.post("/send-verify-email", async (req, res) => {
    try {
        const { emailOrPhoneNumber } = req.body
        const user = await User.findOne({ $or: [{ email: emailOrPhoneNumber }, { phoneNumber: emailOrPhoneNumber }] })
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }
        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" })
        }
        const email = user.email

        const hashedEmail = await bcrypt.hash(email as string, 10)

        sendVerifyEmail({ email, verifyToken: hashedEmail })
        res.status(200).json({ success: true, message: "Email sent" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// VERIFY EMAIL
router.get("/verify-email", async (req, res) => {
    try {
        const { email, token } = req.query
        const isMatch = await bcrypt.compare(email as string, token as string)
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Token is invalid"
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: "User does not exist" })
        }

        user.isEmailVerified = true
        await user.save()

        res.render("email-verified", { email })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
