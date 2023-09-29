import { Schema, Types, model } from "mongoose"
import { ICredential, SCHEMA_NAME } from "../../interface"

const CredentialSchema = new Schema<ICredential>(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        password: {
            type: String
        }
    },
    {
        versionKey: false
    }
)

export default model<ICredential>(SCHEMA_NAME.CREDENTIALS, CredentialSchema, SCHEMA_NAME.CREDENTIALS)
