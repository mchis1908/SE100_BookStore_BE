import { Types } from "mongoose"
import IBook from "./IBook"
import IInvoice from "./IInvoice"

export default interface IInvoiceDetail {
    book: Types.ObjectId | IBook
    quantity: number
}
