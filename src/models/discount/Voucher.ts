import { PaginateModel, Schema, model } from "mongoose"
import { ERank, IVoucher, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

const VoucherSchema = new Schema<IVoucher>(
    {
        name: {
            type: String,
            required: true
        },
        customersUsed: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.USERS
            }
        ],
        discountValue: {
            type: Number
        },
        expirationDate: {
            type: Date,
            default: new Date(),
            min: [new Date(), "Expiration date must be greater than or equal to today"]
        },
        code: {
            type: String,
            required: true,
            unique: true
        },
        level: {
            type: Number,
            default: 1,
            required: true
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

VoucherSchema.plugin(mongooseePaginate)

export default model<IVoucher, PaginateModel<IVoucher>>(SCHEMA_NAME.VOUCHERS, VoucherSchema, SCHEMA_NAME.VOUCHERS)
