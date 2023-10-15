import { PaginateModel, Schema, model } from "mongoose"
import { ISalary, SCHEMA_NAME } from "../../interface"
import paginate from "mongoose-paginate-v2"

const SalarySchema = new Schema<ISalary>(
    {
        month: {
            type: Number,
            default: new Date().getMonth() + 1
        },
        year: {
            type: Number,
            default: new Date().getFullYear()
        },
        workingDays: {
            type: Number,
            default: 0
        },
        forceWorkingDays: {
            type: Number,
            default: 0
        },
        total: {
            type: Number,
            default: 0
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

SalarySchema.plugin(paginate)

export default model<ISalary, PaginateModel<ISalary>>(SCHEMA_NAME.SALARIES, SalarySchema, SCHEMA_NAME.SALARIES)
