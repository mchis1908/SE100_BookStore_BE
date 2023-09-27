import { Types } from "mongoose"
import IFloor from "../book-store/IFloor"

export default interface IBookStore {
    name: string
    description: string
    openAt: Date
    closeAt: Date
    address: string
    map: string // this is the path to the map image
    rules: string[]
    floors: Types.ObjectId[] | IFloor[]
}
