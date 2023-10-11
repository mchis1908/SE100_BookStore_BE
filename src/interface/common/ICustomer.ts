import { Types } from "mongoose"
import IBook from "../book/IBook"
import IVoucher from "../discount/IVoucher"

export enum ERank {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}

export const RANKS = {
    1: ERank.BRONZE,
    2: ERank.SILVER,
    3: ERank.GOLD,
    4: ERank.PLATINUM
}

export default interface ICustomer {
    purchasedBooks: Types.ObjectId[] | IBook[]
    isLoyalCustomer: boolean
    level: number
    rank: ERank
    point: number
    usedVouchers: Types.ObjectId[] | IVoucher[]
}
