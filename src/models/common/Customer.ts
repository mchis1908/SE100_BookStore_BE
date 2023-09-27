import { Schema, model } from "mongoose"
import { ICustomer, SCHEMA_NAME } from "../../interface"

const CustomerSchema = new Schema<ICustomer>({
    isLoyalCustomer: {
        type: Boolean,
        default: false
    },
    purchasedBooks: [
        {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.BOOKS
        }
    ]
})

export default model<ICustomer>(SCHEMA_NAME.CUSTOMERS, CustomerSchema, SCHEMA_NAME.CUSTOMERS)
