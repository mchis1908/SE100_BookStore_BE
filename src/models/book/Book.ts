import { Schema, model } from "mongoose"
import { IBook, SCHEMA_NAME } from "../../interface"
import { MAX_BOOK_QUANTITY } from "../../utils/common"

const BookSchema = new Schema<IBook>(
    {
        name: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        translator: {
            type: String
        },
        barcode: {
            type: String,
            required: true
        },
        importDate: {
            type: Date
        },
        importPrice: {
            type: Number,
            min: [0, ""],
            default: 0
        },
        publisher: {
            type: String
        },
        publishingYear: {
            type: Number
        },
        quantity: {
            type: Number,
            default: 0,
            max: [MAX_BOOK_QUANTITY, `Maximum quantity is ${MAX_BOOK_QUANTITY}`]
        },
        categories: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.BOOK_CATEGORIES
            }
        ],
        salesPrice: {
            type: Number,
            default: 0
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<IBook>(SCHEMA_NAME.BOOKS, BookSchema, SCHEMA_NAME.BOOKS)
