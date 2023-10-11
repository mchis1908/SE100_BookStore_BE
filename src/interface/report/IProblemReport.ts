export enum EProblemReportStatus {
    PENDING = "PENDING",
    RESOLVED = "RESOLVED",
    REJECTED = "REJECTED"
}
export default interface IProblemReport {
    images: string[]
    title: string
    description: string
    announcer: string
    reportingLocation: string
    status: EProblemReportStatus
}
