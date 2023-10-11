import { Types } from "mongoose"

export interface ISalaryScale {
    index: number
    coefficient: number
}
export default interface IEmployee {
    startDateOfWork: Date
    seniority: number
    salary: number
    salaryScale: Types.ObjectId | ISalaryScale
}
