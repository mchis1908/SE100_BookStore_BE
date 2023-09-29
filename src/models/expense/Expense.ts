import { Schema, model } from "mongoose"
import { IExpense, SCHEMA_NAME } from "../../interface"

const ExpenseSchema = new Schema<IExpense>(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        expenseType: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.EXPENSE_TYPES
        },
        beingApprovedAt: {
            type: Date
        },
        description: {
            type: String
        },
        cost: {
            type: Number
        },
        isApproved: {
            type: Boolean,
            default: false
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

export default model<IExpense>(SCHEMA_NAME.EXPENSES, ExpenseSchema, SCHEMA_NAME.EXPENSES)
