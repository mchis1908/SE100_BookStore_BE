import { Types } from "mongoose"
import internal from "stream"
import IBookCategory from "./IBookCategory"

export default interface IBook {
    author: string
    barcode: string
    publishingYear: number
    publisher: string
    categories: Types.ObjectId[] | IBookCategory[]
    quantity: number
    importDate: Date
    importPrice: number
    salesPrice: number
}
