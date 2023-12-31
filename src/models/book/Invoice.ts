import { PaginateModel, Schema, model } from "mongoose"
import { IInvoice, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"
import moment from "moment"

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
        eventDiscountValue: {
            type: Number
        },
        vouchers: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.VOUCHERS
            }
        ]
    },
    {
        versionKey: false,
        timestamps: {
            currentTime: () => Date.now() + 7 * 60 * 60 * 1000
        }
    }
)

InvoiceSchema.plugin(mongooseePaginate)

export default model<IInvoice, PaginateModel<IInvoice>>(SCHEMA_NAME.INVOICES, InvoiceSchema, SCHEMA_NAME.INVOICES)
