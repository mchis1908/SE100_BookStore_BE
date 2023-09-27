import { Types } from "mongoose"
import IPreOrderBook from "./IPreOrderBook"
import IBook from "../book/IBook"

export default interface IPreOrderBookDetail {
    preOrderBook: Types.ObjectId | IPreOrderBook
    book: Types.ObjectId | IBook
    quantity: number
}
