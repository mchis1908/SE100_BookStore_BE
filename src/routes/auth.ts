import bcrypt from "bcryptjs"
import express, { Request, Response } from "express"
import jwt from "jsonwebtoken"
import doNotAllowFields from "../middleware/not-allow-field"
import mustHaveFields from "../middleware/must-have-field"
import { EUserRole, IAdmin, ICustomer, IEmployee, IUser, SCHEMA_NAME } from "../interface"
import { Admin, Customer, Employee, User } from "../models"
import Credential from "../models/common/Credential"

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

router.post("/signin", mustHaveFields("emailOrphoneNumber", "password"), async (req, res) => {
    const { emailOrphoneNumber, password } = req.body
    try {
        const user = await User.findOne({ $or: [{ email: emailOrphoneNumber }, { phoneNumber: emailOrphoneNumber }] })
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

export default router
