import { Types } from "mongoose"
import IExpenseType from "./IExpenseType"
import IUser from "../common/IUser"

export enum EExpenseStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED"
}
export default interface IExpense {
    expenseType: Types.ObjectId | IExpenseType
    statusUpdatedBy: Types.ObjectId | IUser
    cost: number
    description: string
    statusUpdatedAt: Date
    status: EExpenseStatus
}
