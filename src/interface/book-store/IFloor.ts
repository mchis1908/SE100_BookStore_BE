import { Types } from "mongoose"
import IRow from "./IRow"

export default interface IFloor {
    index: number
    rows: Types.ObjectId[] | IRow[]
}
