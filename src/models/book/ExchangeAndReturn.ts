import { PaginateModel, Schema, model } from "mongoose"
import { IExchangeAndReturn, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

const ExchangeAndReturnSchema = new Schema<IExchangeAndReturn>(
    {
        customerName: {
            type: String
        },
        damagedBook: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.BOOKS
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        quantity: {
            type: Number
        },
        reason: {
            type: String
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

ExchangeAndReturnSchema.plugin(mongooseePaginate)

export default model<IExchangeAndReturn, PaginateModel<IExchangeAndReturn>>(
    SCHEMA_NAME.EXCHANGE_AND_RETURNS,
    ExchangeAndReturnSchema,
    SCHEMA_NAME.EXCHANGE_AND_RETURNS
)
