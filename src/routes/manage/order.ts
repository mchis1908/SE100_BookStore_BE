import { NextFunction, Request, Response, Router } from "express"
import { Types } from "mongoose"
import { ERank, ICustomer, IInvoice, IInvoiceDetail, IUser } from "../../interface"
import { EINVOICE_TYPE, IUserInvoice } from "../../interface/book/IInvoice"
import mustHaveFields from "../../middleware/must-have-field"
import verifyRole from "../../middleware/verifyRole"
import { Book, Customer, Invoice, User, Voucher } from "../../models"
import InvoiceDetails from "../../models/book/InvoiceDetails"
import UserInvoice from "../../models/book/UserInvoice"
import { GOLD_REACH_POINT, PLATINUM_REACH_POINT, POINT_RANKING, SILVER_REACH_POINT } from "../../utils/common"
import { sendOrderInvoice } from "../../template/mail"

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
            const { invoiceDetails, customer, total, vouchers, eventDiscountValue } = req.body

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
                    break
                case newPoint >= GOLD_REACH_POINT:
                    __customer.rank = ERank.GOLD
                    break
                case newPoint >= SILVER_REACH_POINT:
                    __customer.rank = ERank.SILVER
                    break
                default:
                    __customer.rank = ERank.BRONZE
                    break
            }

            const userInvoice = await UserInvoice.create({
                eventDiscountValue,
                vouchers
            })
            __customer.lastTransaction = new Date()
            await __customer.save()
            const newInvoiceDetails = await InvoiceDetails.insertMany(invoiceDetails)

            const invoiceDetailsIds = newInvoiceDetails.map((invoiceDetail) => invoiceDetail._id)

            invoiceDetails.forEach(async (invoiceDetail: IInvoiceDetail) => {
                const _book = await Book.findById(invoiceDetail.book)
                if (_book) {
                    _book.quantity -= invoiceDetail.quantity
                    await _book.save()
                }
            })

            const newInvoice = await Invoice.create({
                employee: new toId(req.user_id),
                invoiceDetails: invoiceDetailsIds,
                total,
                invoice: userInvoice._id,
                type: EINVOICE_TYPE.USER,
                refPath: EINVOICE_TYPE.USER,
                customer: _customer._id
            })

            const _newInvoice = await Invoice.findById(newInvoice._id, undefined, {
                populate: [
                    {
                        path: "invoiceDetails",
                        populate: {
                            path: "book",
                            select: "name author salesPrice"
                        }
                    },
                    {
                        path: "customer",
                        select: "name phoneNumber address email"
                    },
                    {
                        path: "employee",
                        select: "name phoneNumber"
                    },
                    {
                        path: "invoice",
                        populate: {
                            path: "vouchers",
                            select: "name discountValue code"
                        }
                    }
                ]
            })

            sendOrderInvoice({ email: _customer.email, invoice: _newInvoice as IInvoice<IUserInvoice> })

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

export default router
