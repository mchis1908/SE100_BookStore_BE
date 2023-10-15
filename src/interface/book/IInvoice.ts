import { Types } from "mongoose"
import IInvoiceDetail from "./IInvoiceDetail"
import IUser from "../common/IUser"
import IVoucher from "../discount/IVoucher"

export default interface IInvoice {
    _id: Types.ObjectId
    employee: Types.ObjectId | IUser
    total: number
    note: string
    invoiceDetails: Types.ObjectId[] | IInvoiceDetail[]
    customer: string | Types.ObjectId | IUser
    createdAt: Date
    eventDiscountValue: number
    vouchers: Types.ObjectId[] | IVoucher[]
}
