import { Schema, model } from "mongoose"
import { IUserInvoice } from "../../interface/book/IInvoice"
import { SCHEMA_NAME } from "../../interface"

const UserInvoice = new Schema<IUserInvoice>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.USERS
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
})

export default model<IUserInvoice>(SCHEMA_NAME.USER_INVOICES, UserInvoice, SCHEMA_NAME.USER_INVOICES)