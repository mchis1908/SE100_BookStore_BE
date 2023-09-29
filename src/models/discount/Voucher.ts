import { Schema, model } from "mongoose"
import { IVoucher, SCHEMA_NAME } from "../../interface"

const VoucherSchema = new Schema<IVoucher>(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        customer: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
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
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<IVoucher>(SCHEMA_NAME.VOUCHERS, VoucherSchema, SCHEMA_NAME.VOUCHERS)
