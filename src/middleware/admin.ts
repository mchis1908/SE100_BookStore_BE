import jwt, { JwtPayload } from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { EUserRole } from "../interface/common/IUser"
import User from "../models/User"

const verifyAdmin = async (req: Request, res: Response, next: NextFunction) => {
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
        if (user.role !== EUserRole.ADMIN) {
            return res.status(403).json({ success: false, message: "You are not admin." })
        }
        next()
    } catch {
        return res.status(403).json({ success: false, message: "Invalid token." })
    }
}

export default verifyAdmin
