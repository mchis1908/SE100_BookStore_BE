import { Schema, model } from "mongoose"
import { ISalaryScale } from "../../interface/common/IEmployee"
import { SCHEMA_NAME } from "../../interface"

const SalaryScaleSchema = new Schema<ISalaryScale>(
    {
        coefficient: {
            type: Number,
            required: [true, "Coefficient is required"],
            min: [0, "Coefficient must be greater than or equal to 0"]
        },
        index: {
            type: Number,
            required: [true, "Index is required"],
            min: [0, "Index must be greater than or equal to 0"]
        }
    },
    {
        versionKey: false
    }
)

export default model<ISalaryScale>(SCHEMA_NAME.SALARY_SCALES, SalaryScaleSchema, SCHEMA_NAME.SALARY_SCALES)
