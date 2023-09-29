import { Schema, model } from "mongoose"
import { IDiscountBook, SCHEMA_NAME } from "../../interface"

const DiscountBookSchema = new Schema<IDiscountBook>(
    {
        book: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.BOOKS
        },
        remaining: {
            type: Number
        }
    },
    {
        versionKey: false
    }
)

export default model<IDiscountBook>(SCHEMA_NAME.DISCOUNT_BOOKS, DiscountBookSchema, SCHEMA_NAME.DISCOUNT_BOOKS)
