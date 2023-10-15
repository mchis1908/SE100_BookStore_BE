import { PaginateModel, Schema, model } from "mongoose"
import { IBookCategory, SCHEMA_NAME } from "../../interface"
import paginate from "mongoose-paginate-v2"

const BookCategorySchema = new Schema<IBookCategory>(
    {
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
    },
    {
        versionKey: false
    }
)

BookCategorySchema.plugin(paginate)

export default model<IBookCategory, PaginateModel<IBookCategory>>(
    SCHEMA_NAME.BOOK_CATEGORIES,
    BookCategorySchema,
    SCHEMA_NAME.BOOK_CATEGORIES
)
