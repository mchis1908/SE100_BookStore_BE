import { PaginateModel, Schema, model } from "mongoose"
import { ERank, IMembershipCard, SCHEMA_NAME } from "../../interface"
import mongoosePaginate from "mongoose-paginate-v2"

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

MembershipCardSchema.plugin(mongoosePaginate)

export default model<IMembershipCard, PaginateModel<IMembershipCard>>(
    SCHEMA_NAME.MEMBERSHIP_CARDS,
    MembershipCardSchema,
    SCHEMA_NAME.MEMBERSHIP_CARDS
)
