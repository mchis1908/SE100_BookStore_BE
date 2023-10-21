import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import { IVoucher } from "../../interface"
import mustHaveFields from "../../middleware/must-have-field"
import { Customer, User, Voucher } from "../../models"
import doNotAllowFields from "../../middleware/not-allow-field"
import voucherCode from "voucher-code-generator"
import { PaginateOptions, Types } from "mongoose"
import { sendVoucher } from "../../template/mail"

const router = Router()
const toId = Types.ObjectId

// GET ALL VOUCHERS
router.get("/", verifyRole(), async (req: Request, res: Response) => {
    try {
        const { page, limit, level, customer_id, canGetLowerLevel } = req.query
        const options: PaginateOptions = {
            page: parseInt(page as string, 10) || 1,
            limit: parseInt(limit as string, 10) || 10
        }
        await Voucher.paginate(
            level
                ? {
                      level: canGetLowerLevel === "true" ? { $lte: level } : level,
                      customersUsed: customer_id
                          ? {
                                $ne: customer_id
                            }
                          : {
                                $exists: true
                            }
                  }
                : {},
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                return res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// CREATE VOUCHER
router.post(
    "/create",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IVoucher>("discountValue", "expirationDate", "name", "level"),
    async (req: Request, res: Response) => {
        try {
            const { expirationDate } = req.body as IVoucher
            if (new Date(expirationDate) < new Date()) {
                return res.status(400).json({ success: false, message: `Expiration date must be in the future` })
            }

            // eslint-disable-next-line no-inner-declarations
            async function reTryGenerateCode() {
                const code = voucherCode.generate({
                    length: 16,
                    count: 1,
                    charset: voucherCode.charset("alphabetic").toUpperCase()
                })[0]
                const voucher = await Voucher.findOne({ code })
                if (voucher) {
                    // retry if code is duplicated with another voucher after 3s
                    return setTimeout(() => {
                        reTryGenerateCode()
                    }, 3000)
                }
                return code
            }

            const voucher = await Voucher.create({
                ...req.body,
                code: await reTryGenerateCode()
            })

            const customers = await Customer.find({
                level: { $gte: voucher.level }
            })

            const customerEmails = await User.find({
                user: { $in: customers.map((customer) => customer._id) }
            }).select("email")
            const emails = customerEmails.map((user) => user.email)
            for (const email of emails) {
                sendVoucher({ email, voucher })
            }

            res.status(201).json({ success: true, message: "Voucher created successfully", voucher })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// USE VOUCHER
router.put(
    "/use/:voucher_id",
    verifyRole(["admin", "employee"]),
    doNotAllowFields<IVoucher>("discountValue", "expirationDate"),
    async (req: Request, res: Response) => {
        try {
            const { voucher_id } = req.params
            const { customer_id } = req.query
            if (!customer_id) return res.status(400).json({ success: false, message: "Missing customer_id" })
            const voucher = await Voucher.findById(voucher_id)
            if (!voucher) {
                return res.status(400).json({ success: false, message: `Voucher ${voucher_id} does not exist` })
            }
            const customerId = new toId(customer_id.toString())
            const isCustomerUsedVoucher = voucher.customersUsed.find((customer) => customer.toString() === customer_id)
            if (isCustomerUsedVoucher) {
                return res
                    .status(400)
                    .json({ success: false, message: `Voucher ${voucher.name} has already been used` })
            }
            if (voucher.expirationDate < new Date()) {
                return res.status(400).json({ success: false, message: `Voucher ${voucher.name} has expired` })
            }
            await Customer.updateOne({ _id: customerId }, { $push: { vouchers: voucher_id } })
            await voucher.updateOne(
                {
                    $push: {
                        customersUsed: customerId
                    }
                },
                {
                    new: true
                }
            )
            res.status(200).json({ success: true, message: "Voucher used successfully", voucher })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// DELETE VOUCHER
router.delete("/:voucher_id", verifyRole(["admin", "employee", "customer"]), async (req: Request, res: Response) => {
    try {
        const { voucher_id } = req.params
        const voucher = await Voucher.findById(voucher_id)
        if (!voucher) {
            return res.status(400).json({ success: false, message: `Voucher ${voucher_id} does not exist` })
        }
        await Customer.updateOne({ _id: req.user_id }, { $pull: { usedVouchers: voucher_id } })
        await voucher.deleteOne()
        res.status(200).json({ success: true, message: "Voucher deleted successfully", voucher })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
