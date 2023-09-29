import { Schema, model } from "mongoose"
import { IDiscountEvent, SCHEMA_NAME } from "../../interface"

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

export default model<IDiscountEvent>(SCHEMA_NAME.DISCOUNT_EVENTS, DiscountEventSchema, SCHEMA_NAME.DISCOUNT_EVENTS)
