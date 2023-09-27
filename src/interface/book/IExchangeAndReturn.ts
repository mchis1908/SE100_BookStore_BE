import { Types } from "mongoose"
import IUser from "../common/IUser"
import IBook from "./IBook"

export default interface IExchangeAndReturn {
    customerName: string
    damagedBook: Types.ObjectId | IBook
    employee: Types.ObjectId | IUser
    quantity: number
    reason: string
}
