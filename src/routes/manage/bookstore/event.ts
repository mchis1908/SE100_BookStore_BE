import { Request, Response, Router } from "express"
import { Book, DiscountEvent } from "../../../models"
import verifyRole from "../../../middleware/verifyRole"
import mustHaveFields from "../../../middleware/must-have-field"
import { IDiscountEvent } from "../../../interface"
import { PaginateOptions } from "mongoose"

const router = Router()

// CREATE EVENT
router.post(
    "/",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IDiscountEvent>("discountBooks", "startAt", "endAt", "name", "image", "eventDiscountValue"),
    async (req: Request, res: Response) => {
        try {
            const { startAt, endAt, discountBooks, eventDiscountValue } = req.body as IDiscountEvent

            if (startAt > endAt)
                return res.status(400).json({ success: false, message: "Start time must be before end time" })
            const newEvent = await DiscountEvent.create({
                ...req.body
            })
            await Book.updateMany(
                { _id: { $in: [...discountBooks, ...newEvent.discountBooks] } },
                {
                    $set: {
                        discountValue: eventDiscountValue
                    }
                }
            )
            res.json({ success: true, message: "Event created successfully", data: newEvent })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT EVENT
router.put("/:event_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { event_id } = req.params
        if (!event_id) return res.status(400).json({ success: false, message: "Missing event_id" })
        const event = await DiscountEvent.findByIdAndUpdate(
            event_id,
            {
                $set: {
                    ...req.body
                }
            },
            { new: true }
        )
        if (!event) return res.status(400).json({ success: false, message: "Event not found" })

        await Book.updateMany(
            { _id: { $in: event.discountBooks } },
            {
                $set: {
                    discountValue: event.eventDiscountValue
                }
            },
            { new: true }
        )
        res.json({ success: true, message: "Event updated successfully" })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET CURRENT EVENT
router.get("/current", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const event = await DiscountEvent.findOne({
            startAt: { $lte: new Date() },
            endAt: { $gte: new Date() }
        })
        res.json({ success: true, data: event })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET PASS EVENTS
router.get("/pass", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { page, limit } = req.query
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { endAt: 1 }
        }
        await DiscountEvent.paginate(
            {
                endAt: { $lte: new Date() }
            },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                return res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET UPCOMING EVENTS
router.get("/upcoming", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { page, limit } = req.query
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { startAt: 1 }
        }
        await DiscountEvent.paginate(
            {
                startAt: { $gte: new Date() }
            },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                return res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET EVENT BY ID
router.get("/:event_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { event_id } = req.params
        if (!event_id) return res.status(400).json({ success: false, message: "Missing event_id" })
        const event = await DiscountEvent.findById(event_id, undefined, {
            populate: {
                path: "discountBooks",
                populate: {
                    path: "categories"
                }
            }
        })
        if (!event) return res.status(400).json({ success: false, message: "Event not found" })
        res.json({ success: true, data: event })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
