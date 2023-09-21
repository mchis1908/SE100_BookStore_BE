import "jsonwebtoken"

declare module "jsonwebtoken" {
    export interface JwtPayload {
        user_id: string
    }
}
