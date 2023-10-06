import { PaginateModel, Schema, model } from "mongoose"
import { IDiscountBook, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

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
        versionKey: false,
        timestamps: true
    }
)

DiscountBookSchema.plugin(mongooseePaginate)

export default model<IDiscountBook, PaginateModel<IDiscountBook>>(
    SCHEMA_NAME.DISCOUNT_BOOKS,
    DiscountBookSchema,
    SCHEMA_NAME.DISCOUNT_BOOKS
)
