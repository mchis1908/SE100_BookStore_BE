import { Types } from "mongoose"
import IUser from "../common/IUser"

export enum ERank {
    BRONZE = "bronze",
    SILVER = "silver",
    GOLD = "gold",
    PLATINUM = "platinum"
}

export default interface IMembershipCard {
    customer: Types.ObjectId | IUser
    point: number
    rank: ERank
    lastTransaction: Date
}
