import { Types } from "mongoose"
import IAdmin from "./IAdmin"
import ICustomer from "./ICustomer"
import IEmployee from "./IEmployee"

export enum EUserRole {
    ADMIN = "admin",
    EMPLOYEE = "employee",
    CUSTOMER = "customer"
}

interface IUser<T = IAdmin | IEmployee | ICustomer> {
    role: EUserRole
    name: string
    birthdate?: Date
    phoneNumber: string
    email: string
    address: string
    password: string
    user: Types.ObjectId | T
    refPath: string // this is the path to the user's document in the database
    isDeleted?: boolean
}

export default IUser
