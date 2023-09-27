import { Types } from "mongoose"
import IInvoiceDetail from "./IInvoiceDetail"
import IUser from "../common/IUser"
import IVoucher from "../discount/IVoucher"

export default interface IInvoice {
    employee: Types.ObjectId | IUser
    vouchers: Types.ObjectId[] | IVoucher[]
    eventDiscountValue: number
    customer: string | Types.ObjectId | IUser
    total: number
    note: string
    invoiceDetails: Types.ObjectId[] | IInvoiceDetail[]
}
