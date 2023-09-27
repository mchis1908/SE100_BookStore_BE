import { Schema, model } from "mongoose"
import { IPreOrderBook, SCHEMA_NAME } from "../../interface"

const PreOrderBookSchema = new Schema<IPreOrderBook>({
    customer: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.CUSTOMERS
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.EMPLOYEES
    },
    deposit: {
        type: Number
    },
    expirationDate: {
        type: Date
    },
    note: {
        type: String
    }
})

export default model<IPreOrderBook>(SCHEMA_NAME.PREORDER_BOOKS, PreOrderBookSchema, SCHEMA_NAME.PREORDER_BOOKS)
