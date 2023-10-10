import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import { IVoucher } from "../../interface"
import mustHaveFields from "../../middleware/must-have-field"
import { User, Voucher } from "../../models"
import doNotAllowFields from "../../middleware/not-allow-field"
import voucherCode from "voucher-code-generator"

const router = Router()

// CREATE VOUCHER
router.post(
    "/create",
    verifyRole(["admin", "customer"]),
    mustHaveFields<IVoucher>("customer", "discountValue", "expirationDate", "name"),
    doNotAllowFields<IVoucher>("isUsed"),
    async (req: Request, res: Response) => {
        try {
            const { customer, expirationDate } = req.body as IVoucher
            const _customer = await User.findById(customer)
            if (!_customer) {
                return res.status(400).json({ success: false, message: `Customer ${customer} does not exist` })
            }
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
            res.status(201).json({ success: true, message: "Voucher created successfully", voucher })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// USE VOUCHER
router.put(
    "/use",
    verifyRole(["admin", "customer"]),
    doNotAllowFields<IVoucher>("customer", "discountValue", "expirationDate"),
    async (req: Request, res: Response) => {
        try {
            const { voucher_id } = req.query
            const voucher = await Voucher.findById(voucher_id)
            if (!voucher) {
                return res.status(400).json({ success: false, message: `Voucher ${voucher_id} does not exist` })
            }
            if (voucher.isUsed) {
                return res
                    .status(400)
                    .json({ success: false, message: `Voucher ${voucher.name} has already been used` })
            }
            if (voucher.expirationDate < new Date()) {
                return res.status(400).json({ success: false, message: `Voucher ${voucher.name} has expired` })
            }
            voucher.isUsed = true
            await voucher.save()
            res.status(200).json({ success: true, message: "Voucher used successfully", voucher })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// DELETE VOUCHER
router.delete("/delete", verifyRole(["admin", "customer"]), async (req: Request, res: Response) => {
    try {
        const { voucher_id } = req.query
        const voucher = await Voucher.findById(voucher_id)
        if (!voucher) {
            return res.status(400).json({ success: false, message: `Voucher ${voucher_id} does not exist` })
        }
        await voucher.deleteOne()
        res.status(200).json({ success: true, message: "Voucher deleted successfully", voucher })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
