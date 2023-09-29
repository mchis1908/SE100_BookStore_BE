import { Schema, model } from "mongoose"
import { IInvoice, SCHEMA_NAME } from "../../interface"

const InvoiceSchema = new Schema<IInvoice>(
    {
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
        total: {
            type: Number
        },
        note: {
            type: String
        },
        invoice: {
            type: Schema.Types.ObjectId,
            refPath: "refPath"
        },
        refPath: {
            type: String,
            required: true,
            enum: [SCHEMA_NAME.USER_INVOICES, SCHEMA_NAME.IMPORT_INVOICES]
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<IInvoice>(SCHEMA_NAME.INVOICES, InvoiceSchema, SCHEMA_NAME.INVOICES)
