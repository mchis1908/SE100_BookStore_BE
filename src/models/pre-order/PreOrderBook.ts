import { PaginateModel, Schema, model } from "mongoose"
import { IPreOrderBook, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

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

PreOrderBookSchema.plugin(mongooseePaginate)

export default model<IPreOrderBook, PaginateModel<IPreOrderBook>>(
    SCHEMA_NAME.PREORDER_BOOKS,
    PreOrderBookSchema,
    SCHEMA_NAME.PREORDER_BOOKS
)
