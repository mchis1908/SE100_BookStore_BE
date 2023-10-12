import { Schema, model } from "mongoose"
import { IRow, SCHEMA_NAME } from "../../interface"
import { MAX_ROW } from "../../utils/common"

const RowSchema = new Schema<IRow>(
    {
        index: {
            type: Number,
            default: 1,
            min: [1, "Index must be greater than 0"],
            max: [MAX_ROW, `Index must be less than ${MAX_ROW}`]
        },
        // bookList: [
        //     {
        //         type: Schema.Types.ObjectId,
        //         ref: SCHEMA_NAME.BOOKS
        //     }
        // ],
        floor: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.FLOORS
        },
        numberOfEmployee: {
            type: Number
        }
    },
    {
        versionKey: false
    }
)

export default model<IRow>(SCHEMA_NAME.ROWS, RowSchema, SCHEMA_NAME.ROWS)
