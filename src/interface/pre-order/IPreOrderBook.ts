import { Types } from "mongoose"
import IUser from "../common/IUser"
import IPreOrderBookDetail from "./IPreOrderBookDetail"

export default interface IPreOrderBook {
    customer: Types.ObjectId | IUser
    employee: Types.ObjectId | IUser
    expirationDate: Date
    note: string
    deposit: number
    preOrderBookDetails: Types.ObjectId[] | IPreOrderBookDetail[]
}
