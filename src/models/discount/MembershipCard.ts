import { Schema, model } from "mongoose"
import { ERank, IMembershipCard, SCHEMA_NAME } from "../../interface"

const MembershipCardSchema = new Schema<IMembershipCard>(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: SCHEMA_NAME.USERS
        },
        lastTransaction: {
            type: Date,
            default: Date.now()
        },
        point: {
            type: Number,
            default: 0
        },
        rank: {
            type: String,
            enum: Object.values(ERank),
            default: ERank.BRONZE
        }
    },
    {
        versionKey: false
    }
)

export default model<IMembershipCard>(SCHEMA_NAME.MEMBERSHIP_CARDS, MembershipCardSchema, SCHEMA_NAME.MEMBERSHIP_CARDS)
