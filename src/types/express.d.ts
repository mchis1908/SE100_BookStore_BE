import "express"
import { EUserRole } from "../interface"

declare module "express" {
    export interface Request {
        user_id: string
    }
}
