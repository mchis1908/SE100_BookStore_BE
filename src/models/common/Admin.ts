import { Schema, model } from "mongoose"
import SCHEMA_NAME from "../../interface/common/schema-name"
import IAdmin from "../../interface/common/IAdmin"

const AdminSchema = new Schema<IAdmin>(
    {},
    {
        timestamps: true,
        versionKey: false
    }
)

export default model<IAdmin>(SCHEMA_NAME.ADMINS, AdminSchema, SCHEMA_NAME.ADMINS)
