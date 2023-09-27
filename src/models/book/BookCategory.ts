import { Schema, model } from "mongoose"
import { IBookCategory, SCHEMA_NAME } from "../../interface"

const BookCategorySchema = new Schema<IBookCategory>({
    name: {
        type: String,
        required: true
    },
    popularity: {
        type: Number
    },
    row: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.ROWS
    }
})

export default model<IBookCategory>(SCHEMA_NAME.BOOK_CATEGORIES, BookCategorySchema, SCHEMA_NAME.BOOK_CATEGORIES)
