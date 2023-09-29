import { Schema, model } from "mongoose"
import { IInvoiceDetail, SCHEMA_NAME } from "../../interface"

const InvoiceDetailsSchema = new Schema<IInvoiceDetail>(
    {
        book: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.BOOKS
        },
        quantity: {
            type: Number
        }
    },
    {
        versionKey: false
    }
)

export default model<IInvoiceDetail>(SCHEMA_NAME.INVOICE_DETAILS, InvoiceDetailsSchema, SCHEMA_NAME.INVOICE_DETAILS)
