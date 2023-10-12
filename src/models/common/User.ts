import { PaginateModel, Schema, model } from "mongoose"
import { EUserRole, IUser, SCHEMA_NAME } from "../../interface"
import mongoosePaginate from "mongoose-paginate-v2"

const UserShema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, "Email is required."],
            match: [/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]+$/, "Please fill a valid email address."],
            unique: true
        },
        address: {
            type: String
        },
        phoneNumber: {
            type: String,
            required: [true, "Phone number is required."],
            match: [/^[0-9]{10}$/, "Please fill a valid phone number."],
            unique: true
        },
        birthdate: {
            type: Date,
            max: [Date.now(), "Birthdate must be less than or equal to today."]
        },
        name: {
            type: String,
            required: [true, "Name is required."],
            minlength: [6, "Name must be at least 6 characters."],
            maxlength: [255, "Name must be at most 255 characters."]
        },
        role: {
            type: String,
            enum: Object.values(EUserRole),
            required: [true, "Role is required."]
        },
        user: {
            type: Schema.Types.ObjectId,
            refPath: "refPath",
            default: null
        },
        refPath: {
            type: String,
            enum: Object.values(SCHEMA_NAME),
            required: [true, "Ref path is required."]
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
)

UserShema.plugin(mongoosePaginate)

export default model<IUser, PaginateModel<IUser>>(SCHEMA_NAME.USERS, UserShema, SCHEMA_NAME.USERS)
