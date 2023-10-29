import { Types } from "mongoose"
import IUser from "./IUser"

export default interface ISalary {
    month: number
    year: number
    workingDays: number
    forceWorkingDays: number
    total: number
    employee: Types.ObjectId | IUser | string
}
