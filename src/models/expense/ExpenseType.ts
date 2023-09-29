import { Schema, model } from "mongoose"
import { IExpenseType, SCHEMA_NAME } from "../../interface"

const ExpenseTypeSchema = new Schema<IExpenseType>(
    {
        description: {
            type: String
        },
        name: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

export default model<IExpenseType>(SCHEMA_NAME.EXPENSE_TYPES, ExpenseTypeSchema, SCHEMA_NAME.EXPENSE_TYPES)
