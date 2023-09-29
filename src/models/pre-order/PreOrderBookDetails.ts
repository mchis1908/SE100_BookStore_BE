import { Schema, model } from "mongoose"
import { IPreOrderBookDetail, SCHEMA_NAME } from "../../interface"

const PreOrderBookDetails = new Schema<IPreOrderBookDetail>(
    {
        book: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.BOOKS
        },
        quantity: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false
    }
)

export default model<IPreOrderBookDetail>(
    SCHEMA_NAME.PREORDER_BOOK_DETAILS,
    PreOrderBookDetails,
    SCHEMA_NAME.PREORDER_BOOK_DETAILS
)
