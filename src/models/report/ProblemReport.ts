import { PaginateModel, Schema, model } from "mongoose"
import { IProblemReport, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"

const ProblemReportSchema = new Schema<IProblemReport>(
    {
        announcer: {
            type: String
        },
        title: {
            type: String
        },
        description: {
            type: String
        },
        images: {
            type: [String]
        },
        reportingLocation: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

ProblemReportSchema.plugin(mongooseePaginate)

export default model<IProblemReport, PaginateModel<IProblemReport>>(
    SCHEMA_NAME.PROBLEM_REPORTS,
    ProblemReportSchema,
    SCHEMA_NAME.PROBLEM_REPORTS
)
