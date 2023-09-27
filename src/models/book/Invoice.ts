import { Schema, model } from "mongoose"
import { IInvoice, SCHEMA_NAME } from "../../interface"

const InvoiceSchema = new Schema<IInvoice>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.CUSTOMERS
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.EMPLOYEES
    },
    invoiceDetails: [
        {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.INVOICE_DETAILS
        }
    ],
    vouchers: [
        {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.VOUCHERS
        }
    ],
    eventDiscountValue: {
        type: Number
    },
    total: {
        type: Number
    },
    note: {
        type: String
    }
})

export default model<IInvoice>(SCHEMA_NAME.INVOICES, InvoiceSchema, SCHEMA_NAME.INVOICES)
