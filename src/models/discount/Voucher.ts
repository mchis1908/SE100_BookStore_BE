import { PaginateModel, Schema, model } from "mongoose"
import { IVoucher, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

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

VoucherSchema.plugin(mongooseePaginate)

export default model<IVoucher, PaginateModel<IVoucher>>(SCHEMA_NAME.VOUCHERS, VoucherSchema, SCHEMA_NAME.VOUCHERS)
