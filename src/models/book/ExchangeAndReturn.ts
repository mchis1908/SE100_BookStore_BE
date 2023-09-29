import { Schema, model } from "mongoose"
import { IExchangeAndReturn, SCHEMA_NAME } from "../../interface"

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
            ref: SCHEMA_NAME.EMPLOYEES
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

export default model<IExchangeAndReturn>(
    SCHEMA_NAME.EXCHANGE_AND_RETURNS,
    ExchangeAndReturnSchema,
    SCHEMA_NAME.EXCHANGE_AND_RETURNS
)
