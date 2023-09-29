import { Schema, model } from "mongoose"
import { IPreOrderBook, SCHEMA_NAME } from "../../interface"

const PreOrderBookSchema = new Schema<IPreOrderBook>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        deposit: {
            type: Number,
            default: 0
        },
        expirationDate: {
            type: Date,
            default: new Date()
        },
        note: {
            type: String
        },
        preOrderBookDetails: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.PREORDER_BOOK_DETAILS
            }
        ]
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<IPreOrderBook>(SCHEMA_NAME.PREORDER_BOOKS, PreOrderBookSchema, SCHEMA_NAME.PREORDER_BOOKS)
