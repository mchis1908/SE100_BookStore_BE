import { Schema, model } from "mongoose"
import { ICustomer, SCHEMA_NAME } from "../../interface"
import { RANKS } from "../../interface/common/ICustomer"

const CustomerSchema = new Schema<ICustomer>(
    {
        isLoyalCustomer: {
            type: Boolean,
            default: true
        },
        purchasedBooks: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.BOOKS
            }
        ],
        level: {
            type: Number,
            default: 1
        },
        rank: {
            type: String,
            enum: Object.values(RANKS),
            default: RANKS[1]
        },
        point: {
            type: Number,
            default: 0
        },
        lastTransaction: {
            type: Date,
            default: Date.now()
        },
        usedVouchers: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.VOUCHERS
            }
        ]
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<ICustomer>(SCHEMA_NAME.CUSTOMERS, CustomerSchema, SCHEMA_NAME.CUSTOMERS)
