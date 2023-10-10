import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import mustHaveFields from "../../middleware/must-have-field"
import { ERank, IInvoice, IInvoiceDetail } from "../../interface"
import { Book, Invoice, MembershipCard, User } from "../../models"
import InvoiceDetails from "../../models/book/InvoiceDetails"
import { POINT_RANKING, RANK } from "../../utils/common"
import { EINVOICE_TYPE, IUserInvoice } from "../../interface/book/IInvoice"
import { Types } from "mongoose"
import UserInvoice from "../../models/book/UserInvoice"

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

            const point = total / POINT_RANKING

            const membershipCard = await MembershipCard.findOne({ customer })
            if (!membershipCard) {
                return res
                    .status(400)
                    .json({ success: false, message: `Customer ${_customer.name} does not have membership card` })
            }

            membershipCard.point += point
            const membershipCardPoint = membershipCard.point
            switch (true) {
                case membershipCardPoint >= RANK.platinum:
                    membershipCard.rank = ERank.PLATINUM
                    break
                case membershipCardPoint >= RANK.gold:
                    membershipCard.rank = ERank.GOLD
                    break
                case membershipCardPoint >= RANK.silver:
                    membershipCard.rank = ERank.SILVER
                    break
                default:
                    membershipCard.rank = ERank.BRONZE
                    break
            }

            membershipCard.lastTransaction = new Date()
            await membershipCard.save()

            const newInvoiceDetails = await InvoiceDetails.insertMany(invoiceDetails)

            const userInvoice = await UserInvoice.create({
                eventDiscountValue,
                vouchers
            })

            const newInvoice = await Invoice.create({
                employee: new toId(req.user_id),
                invoiceDetails: newInvoiceDetails.map((invoiceDetail) => invoiceDetail._id),
                total,
                invoice: userInvoice._id,
                type: EINVOICE_TYPE.USER,
                refPath: EINVOICE_TYPE.USER,
                customer: _customer._id
            })

            res.status(201).json({ success: true, message: "Order created successfully", data: newInvoice })
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
