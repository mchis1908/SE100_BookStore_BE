import { NextFunction, Request, Response } from "express"

const doNotAllowFields =
    <T = string>(...fields: (keyof T)[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const body = req.body

        for (const field of fields) {
            if (body[field]) {
                return res.status(400).json({ success: false, message: `Field ${String(field)} is not allowed` })
            }
        }

        next()
    }

export default doNotAllowFields
