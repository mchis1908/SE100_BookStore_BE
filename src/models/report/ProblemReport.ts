import { Schema, model } from "mongoose"
import { IProblemReport, SCHEMA_NAME } from "../../interface"

const ProblemReportSchema = new Schema<IProblemReport>({
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
})

export default model<IProblemReport>(SCHEMA_NAME.PROBLEM_REPORTS, ProblemReportSchema, SCHEMA_NAME.PROBLEM_REPORTS)
