import { Types } from "mongoose"
import IUser from "../common/IUser"

export default interface IPreOrderBook {
    customer: string | Types.ObjectId | IUser
    employee: Types.ObjectId | IUser
    expirationDate: Date
    note: string
    deposit: number
}
