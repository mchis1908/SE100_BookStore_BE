import { Types } from "mongoose"
import IBook from "../book/IBook"
import IMembershipCard from "../discount/IMembershipCard"

export default interface ICustomer {
    purchasedBooks: Types.ObjectId[] | IBook[]
    isLoyalCustomer: boolean
}
