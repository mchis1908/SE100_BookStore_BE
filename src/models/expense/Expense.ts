import { PaginateModel, Schema, model } from "mongoose"
import { IExpense, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"
import { EExpenseStatus } from "../../interface/expense/IExpense"

const ExpenseSchema = new Schema<IExpense>(
    {
        statusUpdatedBy: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        statusUpdatedAt: {
            type: Date
        },
        description: {
            type: String
        },
        cost: {
            type: Number
        },
        status: {
            type: String,
            enum: Object.values(EExpenseStatus),
            default: EExpenseStatus.PENDING
        },
        images: {
            type: [String],
            default: []
        },
        subject: {
            type: String
        },
        reporter: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        }
    },
    {
        versionKey: false,
        timestamps: true
    }
)

ExpenseSchema.plugin(mongooseePaginate)

export default model<IExpense, PaginateModel<IExpense>>(SCHEMA_NAME.EXPENSES, ExpenseSchema, SCHEMA_NAME.EXPENSES)
