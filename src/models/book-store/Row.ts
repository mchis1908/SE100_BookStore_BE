import { Schema, model } from "mongoose"
import { IRow, SCHEMA_NAME } from "../../interface"

const RowSchema = new Schema<IRow>({
    bookList: [
        {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.BOOKS
        }
    ],
    floor: {
        type: Schema.Types.ObjectId,
        ref: SCHEMA_NAME.FLOORS
    },
    numberOfEmployee: {
        type: Number
    }
})

export default model<IRow>(SCHEMA_NAME.ROWS, RowSchema, SCHEMA_NAME.ROWS)
