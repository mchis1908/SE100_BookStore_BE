import { Types } from "mongoose"
import IDiscountBook from "./IDiscountBook"

export default interface IDiscountEvent {
    startAt: Date
    endAt: Date
    images: string[]
    description: string
    eventDiscountValue: number
    discountBooks: Types.ObjectId | IDiscountBook[]
}
