import { Types } from "mongoose"
import IExpenseType from "./IExpenseType"
import IUser from "../common/IUser"

export default interface IExpense {
    expenseType: Types.ObjectId | IExpenseType
    employee: Types.ObjectId | IUser
    cost: number
    description: string
    beingApprovedAt: Date
    isApproved: boolean
}
