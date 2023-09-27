import { Types } from "mongoose"
import IUser from "../common/IUser"

export default interface IVoucher {
    discountValue: number
    customer: Types.ObjectId | IUser
    isUsed: boolean
    expirationDate: Date
}
