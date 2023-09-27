import { Types } from "mongoose"
import IBook from "../book/IBook"

export default interface ICustomer {
    purchasedBooks: Types.ObjectId[] | IBook[]
    isLoyalCustomer: boolean
}
