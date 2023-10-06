import { PaginateModel, Schema, model } from "mongoose"
import { IExpense, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

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

ExpenseSchema.plugin(mongooseePaginate)

export default model<IExpense, PaginateModel<IExpense>>(SCHEMA_NAME.EXPENSES, ExpenseSchema, SCHEMA_NAME.EXPENSES)
