import { Schema, model } from "mongoose"
import { IEmployee, SCHEMA_NAME } from "../../interface"

const EmployeeSchema = new Schema<IEmployee>(
    {
        salary: {
            type: Number,
            required: [true, "Salary is required"],
            min: [0, "Salary must be greater than or equal to 0"]
        },
        startDateOfWork: {
            type: Date,
            required: [true, "Start date of work is required"],
            min: [Date.now(), "Start date of work must be greater than or equal to today"]
        },
        salaryCoefficient: {
            type: Number,
            required: [true, "Salary coefficient is required"],
            min: [0, "Salary coefficient must be greater than or equal to 0"]
        },
        salaryScale: {
            type: Number,
            required: [true, "Salary scale is required"],
            min: [0, "Salary scale must be greater than or equal to 0"]
        },
        seniority: {
            type: Number,
            required: [true, "Seniority is required"],
            min: [0, "Seniority must be greater than or equal to 0"]
        }
    },
    {
        timestamps: true
    }
)

export default model<IEmployee>(SCHEMA_NAME.EMPLOYEES, EmployeeSchema, SCHEMA_NAME.EMPLOYEES)
