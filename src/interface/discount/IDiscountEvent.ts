import { Types } from "mongoose"
import IDiscountBook from "./IDiscountBook"

export default interface IDiscountEvent {
    name: string
    startAt: Date
    endAt: Date
    image: string
    description: string
    eventDiscountValue: number
    discountBooks: Types.ObjectId | IDiscountBook[]
}
