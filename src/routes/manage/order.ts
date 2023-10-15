import { Request, Response, Router } from "express"
import { Types } from "mongoose"
import { ERank, IInvoice, IInvoiceDetail } from "../../interface"
import mustHaveFields from "../../middleware/must-have-field"
import verifyRole from "../../middleware/verifyRole"
import { Book, Customer, Invoice, User, Voucher } from "../../models"
import InvoiceDetails from "../../models/book/InvoiceDetails"
import { sendOrderInvoice } from "../../template/mail"
import { GOLD_REACH_POINT, PLATINUM_REACH_POINT, POINT_RANKING, SILVER_REACH_POINT } from "../../utils/common"

const router = Router()
const toId = Types.ObjectId

// router.post(
//     "/create-order-item",
//     verifyRole(["admin", "customer"]),
//     mustHaveFields<IInvoiceDetail>("book", "quantity"),
//     async (req: Request, res: Response) => {
//         try {
//             const { book, quantity } = req.body
//             const _book = await Book.findById(book)
//             if (!_book) {
//                 return res.status(400).json({ success: false, message: `Book ${book} does not exist` })
//             }
//             if (quantity > _book.quantity) {
//                 return res.status(400).json({ success: false, message: `Book ${book} does not have enough quantity` })
//             }
//             _book.quantity -= quantity
//             await _book.save()
//             const newInvoiceDetail = await InvoiceDetails.create({
//                 book,
//                 quantity
//             })
//             res.status(201).json({ success: true, message: "Order item created successfully" })
//         } catch (error: any) {
//             res.status(500).json({ success: false, message: error.message })
//         }
//     }
// )

// ORDER INVOICE
router.post(
    "/create-order",
    mustHaveFields<IInvoice>("invoiceDetails", "customer"),
    verifyRole(["admin", "employee"]),
    async (req: Request, res: Response) => {
        try {
            const { invoiceDetails, customer, total, vouchers, eventDiscountValue, note } = req.body

            const _customer = await User.findById(customer)
            if (!_customer) {
                return res.status(400).json({ success: false, message: `Customer ${customer} does not exist` })
            }

            const __customer = await Customer.findById(_customer.user)
            if (!__customer) {
                return res.status(400).json({ success: false, message: `Customer ${customer} does not exist` })
            }

            for (const voucher of vouchers) {
                const _voucher = await Voucher.findById(voucher)
                if (_voucher) {
                    const _voucherCustomersUseds = _voucher.customersUsed.map((customerUsed) => customerUsed.toString())
                    if (_voucherCustomersUseds.includes(customer)) {
                        return res.status(400).json({ success: false, message: `Voucher ${voucher} has been used` })
                    }
                    await _voucher.updateOne({
                        $set: {
                            customersUsed: [..._voucherCustomersUseds, customer]
                        }
                    })
                }
            }

            const point = total / POINT_RANKING
            __customer.point += point
            const newPoint = __customer.point
            switch (true) {
                case newPoint >= PLATINUM_REACH_POINT:
                    __customer.rank = ERank.PLATINUM
                    __customer.level = 4
                    break
                case newPoint >= GOLD_REACH_POINT:
                    __customer.rank = ERank.GOLD
                    __customer.level = 3
                    break
                case newPoint >= SILVER_REACH_POINT:
                    __customer.rank = ERank.SILVER
                    __customer.level = 2
                    break
                default:
                    __customer.rank = ERank.BRONZE
                    __customer.level = 1
                    break
            }

            __customer.lastTransaction = new Date()
            await __customer.save()
            const newInvoiceDetails = await InvoiceDetails.insertMany(invoiceDetails)

            const invoiceDetailsIds = newInvoiceDetails.map((invoiceDetail) => invoiceDetail._id.toString())

            invoiceDetails.forEach(async (invoiceDetail: IInvoiceDetail) => {
                const _book = await Book.findById(invoiceDetail.book)
                if (_book) {
                    _book.quantity -= invoiceDetail.quantity
                    if (_book.quantity < 0) {
                        _book.quantity = 0
                    }
                    await _book.save()
                }
            })

            const newInvoice = await Invoice.create({
                employee: new toId(req.user_id),
                invoiceDetails: invoiceDetailsIds,
                total,
                customer: _customer._id,
                eventDiscountValue,
                vouchers,
                note
            })

            await InvoiceDetails.updateMany({ _id: { $in: invoiceDetailsIds } }, { $set: { invoice: newInvoice._id } })

            const _newInvoice = await Invoice.findById(newInvoice._id, undefined, {
                populate: [
                    {
                        path: "invoiceDetails",
                        populate: {
                            path: "book"
                            // select: "name author salesPrice"
                        }
                    },
                    {
                        path: "customer",
                        select: "name phoneNumber address email"
                    },
                    {
                        path: "employee",
                        select: "name phoneNumber"
                    }
                ]
            })

            sendOrderInvoice({ email: _customer.email, invoice: _newInvoice as IInvoice })

            res.status(201).json({
                success: true,
                message: "Order created successfully",
                data: _newInvoice
            })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// DELETE ORDER INVOICE
router.delete("/delete-invoice/:invoice_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { invoice_id } = req.params
        const invoice = await Invoice.findById(invoice_id)
        if (!invoice) {
            return res.status(400).json({ success: false, message: `Invoice ${invoice_id} does not exist` })
        }
        await InvoiceDetails.deleteMany({ _id: { $in: invoice.invoiceDetails } })
        await invoice.deleteOne()
        res.status(200).json({ success: true, message: "Invoice deleted successfully" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// REFUND
router.post("/refund", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { invoice_id, refund_details } = req.body
        const invoice = await Invoice.findById(invoice_id).populate("invoiceDetails")
        if (!invoice) {
            return res.status(400).json({ success: false, message: `Invoice ${invoice_id} does not exist` })
        }

        const refundDetails = refund_details as IInvoiceDetail[]

        for (const refundDetail of refundDetails) {
            const { book, quantity } = refundDetail
            const _book = await Book.findById(book)
            if (_book) {
                const { salesPrice } = _book
                const invoiceDetail = await InvoiceDetails.findOne({ invoice: invoice_id, book })
                if (!invoiceDetail) {
                    return res
                        .status(400)
                        .json({ success: false, message: `Invoice detail ${invoiceDetail} does not exist` })
                }
                await invoiceDetail.updateOne({ $set: { quantity: invoiceDetail.quantity - quantity } })
                const user = await User.findById(invoice.customer)
                if (!user) {
                    return res.status(400).json({ success: false, message: `User ${invoice.customer} does not exist` })
                }
                const _customer = await Customer.findById(user.user)
                if (_customer) {
                    const totalPrice = salesPrice * quantity
                    const newPoint = _customer.point - totalPrice / POINT_RANKING > 0 ? _customer.point : 0
                    _customer.point = newPoint
                    console.log({ _customer })
                    switch (true) {
                        case newPoint >= PLATINUM_REACH_POINT:
                            _customer.rank = ERank.PLATINUM
                            _customer.level = 4
                            break
                        case newPoint >= GOLD_REACH_POINT:
                            _customer.rank = ERank.GOLD
                            _customer.level = 3
                            break
                        case newPoint >= SILVER_REACH_POINT:
                            _customer.rank = ERank.SILVER
                            _customer.level = 2
                            break
                        default:
                            _customer.rank = ERank.BRONZE
                            _customer.level = 1
                            break
                    }

                    await _customer.save()
                }
            }
        }
        res.status(200).json({ success: true, message: "Refund successfully" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
