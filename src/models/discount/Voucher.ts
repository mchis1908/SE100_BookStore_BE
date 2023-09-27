import { Schema, model } from "mongoose"
import { IVoucher, SCHEMA_NAME } from "../../interface"

const VoucherSchema = new Schema<IVoucher>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.CUSTOMERS
    },
    discountValue: {
        type: Number
    },
    expirationDate: {
        type: Date
    },
    isUsed: {
        type: Boolean,
        default: false
    }
})

export default model<IVoucher>(SCHEMA_NAME.VOUCHERS, VoucherSchema, SCHEMA_NAME.VOUCHERS)
