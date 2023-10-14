import { Request, Response, Router } from "express"
import verifyRole from "../../../middleware/verifyRole"
import mustHaveFields from "../../../middleware/must-have-field"
import { EUserRole, ICustomer, IUser, SCHEMA_NAME } from "../../../interface"
import { Customer, User } from "../../../models"
import bcrypt from "bcryptjs"
import Credential from "../../../models/common/Credential"
import doNotAllowFields from "../../../middleware/not-allow-field"
import { PaginateOptions } from "mongoose"
import { sendNewAccountCreated } from "../../../template/mail"

const router = Router()

// CREATE CUSTOMER ACCOUNT
router.post(
    "/create",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IUser<ICustomer>>("email", "phoneNumber", "name", "password"),
    async (req: Request, res: Response) => {
        try {
            const { email, password, phoneNumber } = req.body

            const user = await User.findOne({ $or: [{ email }, { phoneNumber }] })
            if (user)
                return res
                    .status(400)
                    .json({ success: false, message: "This email/phoneNumber has been used by another" })

            const newCustomer = await Customer.create({})
            const newUser = await User.create({
                ...req.body,
                refPath: SCHEMA_NAME.CUSTOMERS,
                user: newCustomer._id,
                role: EUserRole.CUSTOMER
            })

            newUser.password = password

            const bcryptPassword = await bcrypt.hash(password, 10)
            const newCredential = new Credential({
                user_id: newUser._id,
                password: bcryptPassword
            })
            await newCredential.save()

            sendNewAccountCreated({ email: newUser.email, user: newUser })
            res.json({ success: true, message: "Customer created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT CUSTOMER INFO
router.put(
    "/edit-info/:customer_id",
    verifyRole(["admin", "employee"]),
    doNotAllowFields<IUser>("role", "password"),
    async (req: Request, res: Response) => {
        try {
            const { customer_id } = req.params
            if (!customer_id) return res.status(400).json({ success: false, message: "Missing customer_id" })
            const user = await User.findOne({ user: customer_id })
            if (!user) return res.status(400).json({ success: false, message: "Customer not found" })
            if (user.role !== EUserRole.CUSTOMER)
                return res.status(400).json({ success: false, message: "This is not a customer" })
            await user.updateOne({
                $set: {
                    ...req.body
                }
            })

            res.json({ success: true, message: "Customer updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL CUSTOMERS
router.get("/", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const { page, limit, search_q, isDeleted, sort, sort_by } = req.query
        const sortByArr = sort_by?.toString().split(",") || []
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            populate: {
                path: "user"
            },
            sort: {
                ...(sort_by
                    ? Object.fromEntries(sortByArr.map((item) => [item, !sort || sort === "asc" ? 1 : -1]))
                    : {})
            }
        }
        await User.paginate(
            {
                role: EUserRole.CUSTOMER,
                isDeleted: isDeleted === "true" ? true : false,
                $or: search_q ? [{ name: { $regex: search_q as string, $options: "i" } }] : [{}]
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

// GET TOP 10 CUSTOMERS
router.get("/top-10", verifyRole(["admin", "employee"]), async (req, res) => {
    try {
        const { page, limit } = req.query
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { point: -1 },
            populate: {
                path: "user"
            }
        }
        await User.paginate(
            {
                role: EUserRole.CUSTOMER,
                isDeleted: false
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

export default router
