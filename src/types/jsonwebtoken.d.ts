import "jsonwebtoken"
import { EUserRole } from "../interface"

declare module "jsonwebtoken" {
    export interface JwtPayload {
        user_id: string
    }
}
