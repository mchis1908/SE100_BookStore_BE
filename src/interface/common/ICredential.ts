import { Types } from "mongoose"

export default interface ICredential {
    user_id: Types.ObjectId
    password: string
}
