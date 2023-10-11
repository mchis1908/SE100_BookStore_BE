import { PaginateModel, Schema, model } from "mongoose"
import { IProblemReport, SCHEMA_NAME } from "../../interface"
import mongooseePaginate from "mongoose-paginate-v2"
import { EProblemReportStatus } from "../../interface/report/IProblemReport"

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
        },
        status: {
            type: String,
            enum: Object.values(EProblemReportStatus),
            default: EProblemReportStatus.PENDING
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
