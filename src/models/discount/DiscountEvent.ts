import { PaginateModel, Schema, model } from "mongoose"
import { IDiscountEvent, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

const DiscountEventSchema = new Schema<IDiscountEvent>(
    {
        name: {
            type: String,
            required: [true, "Name is required"]
        },
        discountBooks: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.BOOKS
            }
        ],
        description: {
            type: String
        },
        startAt: {
            type: Date,
            required: [true, "Start date is required"],
            min: [new Date(), "Start date must be after current date"]
        },
        endAt: {
            type: Date,
            required: [true, "End date is required"]
        },
        eventDiscountValue: {
            type: Number
        },
        image: {
            type: String
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
