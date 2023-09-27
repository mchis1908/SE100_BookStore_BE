import { Schema, model } from "mongoose"
import { IBookStore, SCHEMA_NAME } from "../../interface"

const BookStoreSchema = new Schema<IBookStore>(
    {
        name: {
            type: String,
            min: [4, ""],
            max: [20, ""],
            required: true
        },
        description: {
            type: String
        },
        address: {
            type: String
        },
        openAt: {
            type: Date,
            required: [true, ""]
        },
        closeAt: {
            type: Date,
            required: [true, ""]
        },
        map: {
            type: String
        },
        rules: {
            type: [String]
        },
        floors: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.FLOORS
            }
        ]
    },
    {
        timestamps: true
    }
)

export default model<IBookStore>(SCHEMA_NAME.BOOKSTORES, BookStoreSchema, SCHEMA_NAME.BOOKSTORES)
