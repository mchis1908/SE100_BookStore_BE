import { PaginateModel, Schema, model } from "mongoose"
import { IDiscountEvent, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

const DiscountEventSchema = new Schema<IDiscountEvent>(
    {
        discountBooks: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.DISCOUNT_BOOKS
            }
        ],
        description: {
            type: String
        },
        startAt: {
            type: Date
        },
        endAt: {
            type: Date
        },
        eventDiscountValue: {
            type: Number
        },
        images: {
            type: [String]
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

DiscountEventSchema.plugin(mongooseePaginate)

export default model<IDiscountEvent, PaginateModel<IDiscountEvent>>(
    SCHEMA_NAME.DISCOUNT_EVENTS,
    DiscountEventSchema,
    SCHEMA_NAME.DISCOUNT_EVENTS
)
