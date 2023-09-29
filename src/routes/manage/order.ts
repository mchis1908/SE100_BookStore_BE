import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import mustHaveFields from "../../middleware/must-have-field"
import { ERank, IInvoice, IInvoiceDetail } from "../../interface"
import { Book, Invoice, MembershipCard, User } from "../../models"
import InvoiceDetails from "../../models/book/InvoiceDetails"
import { POINT_RANKING, RANK } from "../../utils/common"
import { EINVOICE_TYPE, IUserInvoice } from "../../interface/book/IInvoice"

const router = Router()

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
    mustHaveFields<IInvoice>("invoiceDetails", "employee"),
    mustHaveFields<IUserInvoice>("customer"),
    verifyRole(["admin", "customer"]),
    async (req: Request, res: Response) => {
        try {
            const { invoiceDetails, customer, employee, total, vouchers, eventDiscountValue } = req.body

            const _customer = await User.findById(customer)
            if (!_customer) {
                return res.status(400).json({ success: false, message: `Customer ${customer} does not exist` })
            }

            const _employee = await User.findById(employee)

            if (!_employee) {
                return res.status(400).json({ success: false, message: `Employee ${employee} does not exist` })
            }

            const newInvoiceDetails = await InvoiceDetails.insertMany(invoiceDetails)

            const newInvoice = await Invoice.create({
                employee,
                invoiceDetails: newInvoiceDetails.map((invoiceDetail) => invoiceDetail._id),
                total,
                invoice: {
                    customer,
                    vouchers,
                    eventDiscountValue
                } as IUserInvoice,
                type: EINVOICE_TYPE.USER,
                refPath: EINVOICE_TYPE.USER
            })

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

            res.status(201).json({ success: true, message: "Order created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

export default router
