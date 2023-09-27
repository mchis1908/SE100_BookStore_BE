import { Schema, model } from "mongoose"
import { IFloor, SCHEMA_NAME } from "../../interface"

const FloorSchema = new Schema<IFloor>({
    index: {
        type: Number
    },
    rows: [
        {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.ROWS
        }
    ]
})

export default model<IFloor>(SCHEMA_NAME.FLOORS, FloorSchema, SCHEMA_NAME.FLOORS)
