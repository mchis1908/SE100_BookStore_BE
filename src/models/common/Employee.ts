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
            min: [Date.now(), "Start date of work must be greater than or equal to today"],
            default: Date.now()
        },
        seniority: {
            type: Number,
            min: [0, "Seniority must be greater than or equal to 0"]
        },
        salaryScale: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.SALARY_SCALES
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default model<IEmployee>(SCHEMA_NAME.EMPLOYEES, EmployeeSchema, SCHEMA_NAME.EMPLOYEES)
