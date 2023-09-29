import { Schema, model } from "mongoose"
import { IFloor, SCHEMA_NAME } from "../../interface"
import { MAX_FLOOR } from "../../utils/common"

const FloorSchema = new Schema<IFloor>(
    {
        index: {
            type: Number,
            min: [1, "Index must be greater than 0"],
            max: [MAX_FLOOR, `Index must be less than ${MAX_FLOOR}`]
        },
        rows: [
            {
                type: Schema.Types.ObjectId,
                ref: SCHEMA_NAME.ROWS
            }
        ]
    },
    {
        versionKey: false
    }
)

export default model<IFloor>(SCHEMA_NAME.FLOORS, FloorSchema, SCHEMA_NAME.FLOORS)
