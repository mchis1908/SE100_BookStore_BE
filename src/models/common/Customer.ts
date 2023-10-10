import { Schema, model } from "mongoose"
import { ICustomer, SCHEMA_NAME } from "../../interface"

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
        membershipCard: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.MEMBERSHIP_CARDS
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<ICustomer>(SCHEMA_NAME.CUSTOMERS, CustomerSchema, SCHEMA_NAME.CUSTOMERS)
