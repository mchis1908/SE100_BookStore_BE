import { Types } from "mongoose"
import IUser from "../common/IUser"

export default interface IVoucher {
    name: string
    code: string
    discountValue: number
    customersUsed: Types.ObjectId[] | IUser[]
    expirationDate: Date
    level: number
}
