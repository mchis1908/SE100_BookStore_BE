import { Types } from "mongoose"
import IUser from "../common/IUser"

export enum EExpenseStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED"
}
export default interface IExpense {
    statusUpdatedBy: Types.ObjectId | IUser
    cost: number
    description: string
    statusUpdatedAt: Date
    status: EExpenseStatus
}
