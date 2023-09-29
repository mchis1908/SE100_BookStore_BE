import { NextFunction, Request, Response } from "express"
import jwt, { JwtPayload } from "jsonwebtoken"
import { User } from "../models"

type Role = "admin" | "employee" | "customer"

function verifyRole(roles?: Role[]) {
    return async function (req: Request, res: Response, next: NextFunction) {
        const authHeader = req.header("Authorization")
        const token = authHeader && authHeader.split(" ")[1]

        if (!token) return res.status(401).json({ success: false, message: "Access denied. No token provided." })

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload

            req.user_id = decoded.user_id

            const user = await User.findById(decoded.user_id)
            if (!user) {
                return res.status(401).json({ success: false, message: "Invalid token." })
            }
            if (!roles) return next()
            if (!roles.includes(user.role)) {
                return res
                    .status(403)
                    .json({ success: false, message: `You are not ${roles.join("/")} so you can not access this.` })
            }
            next()
        } catch {
            return res.status(403).json({ success: false, message: "Invalid token." })
        }
    }
}

export default verifyRole
