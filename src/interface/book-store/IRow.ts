import { Types } from "mongoose"
import IBook from "../book/IBook"

export default interface IRow {
    index: number
    numberOfEmployee: number
    // bookList: Types.ObjectId[] | IBook[]
    floor: Types.ObjectId
}
