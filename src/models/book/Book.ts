import { PaginateModel, Schema, model } from "mongoose"
import { IBook, SCHEMA_NAME } from "../../interface"
import { MAX_BOOK_QUANTITY } from "../../utils/common"
import mongooseePaginate from "mongoose-paginate-v2"
import DiscountEvent from "../discount/DiscountEvent"

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
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        discountValue: {
            type: Number,
            default: 1,
            min: [0, "Discount value must be greater than or equal to 0"],
            max: [1, "Discount value must be less than or equal to 1"]
        },
        image: {
            type: String,
            default: ""
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)
BookSchema.plugin(mongooseePaginate)

export default model<IBook, PaginateModel<IBook>>(SCHEMA_NAME.BOOKS, BookSchema, SCHEMA_NAME.BOOKS)
