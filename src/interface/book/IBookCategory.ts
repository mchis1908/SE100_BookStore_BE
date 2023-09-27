import { Types } from "mongoose"
import IRow from "../book-store/IRow"

export default interface IBookCategory {
    name: string
    popularity: number
    row: Types.ObjectId | IRow
}
