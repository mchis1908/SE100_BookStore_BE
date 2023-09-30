import { Types } from "mongoose"
import IInvoiceDetail from "./IInvoiceDetail"
import IUser from "../common/IUser"
import IVoucher from "../discount/IVoucher"
import SCHEMA_NAME from "../common/schema-name"

export enum EINVOICE_TYPE {
    USER = SCHEMA_NAME.USER_INVOICES,
    IMPORT = SCHEMA_NAME.IMPORT_INVOICES
}
export interface IUserInvoice {
    eventDiscountValue: number
    vouchers: Types.ObjectId[] | IVoucher[]
}

export interface IImportInvoice {
    supplier: string
    importDate: Date
}

export default interface IInvoice<T = IUserInvoice | IImportInvoice> {
    employee: Types.ObjectId | IUser
    total: number
    note: string
    invoiceDetails: Types.ObjectId[] | IInvoiceDetail[]
    refPath: string
    invoice: Types.ObjectId | T
    type: EINVOICE_TYPE
    customer: string | Types.ObjectId | IUser
}
