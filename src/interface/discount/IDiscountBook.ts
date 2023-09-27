import { Types } from "mongoose"
import IBook from "../book/IBook"

export default interface IDiscountBook {
    book: Types.ObjectId | IBook
    remaining: number
}
