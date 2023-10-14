import { Types } from "mongoose"
import IBook from "../book/IBook"

export default interface IDiscountEvent {
    name: string
    startAt: Date
    endAt: Date
    image: string
    description: string
    eventDiscountValue: number
    discountBooks: Types.ObjectId[] | IBook[]
}
