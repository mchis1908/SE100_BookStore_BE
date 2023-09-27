import { NextFunction, Request, Response } from "express"

const mustHaveFields =
    <T = string>(...fields: (keyof T)[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const body = req.body
        const leftFields = []
        for (const field of fields) {
            if (!body[field]) {
                leftFields.push(field)
            }
        }

        if (leftFields.length > 0) {
            return res.status(400).json({ success: false, message: `Missing fields: ${leftFields.join(", ")}` })
        }

        next()
    }

export default mustHaveFields
