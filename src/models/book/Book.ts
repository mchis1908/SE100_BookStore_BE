import { Schema, model } from "mongoose"
import { IBook, SCHEMA_NAME } from "../../interface"

const BookSchema = new Schema<IBook>({
    author: {
        type: String,
        required: true
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
        default: 0
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
})

export default model<IBook>(SCHEMA_NAME.BOOKS, BookSchema, SCHEMA_NAME.BOOKS)
