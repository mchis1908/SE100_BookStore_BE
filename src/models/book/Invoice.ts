import { PaginateModel, Schema, model } from "mongoose"
import { IInvoice, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

const InvoiceSchema = new Schema<IInvoice>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
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

InvoiceSchema.plugin(mongooseePaginate)

export default model<IInvoice, PaginateModel<IInvoice>>(SCHEMA_NAME.INVOICES, InvoiceSchema, SCHEMA_NAME.INVOICES)
