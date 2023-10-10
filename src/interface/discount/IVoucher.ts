import { Types } from "mongoose"
import IUser from "../common/IUser"

export default interface IVoucher {
    name: string
    code: string
    discountValue: number
    customer: Types.ObjectId | IUser
    isUsed: boolean
    expirationDate: Date
}
