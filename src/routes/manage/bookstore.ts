import { Request, Response, Router } from "express"
import mustHaveFields from "../../middleware/must-have-field"
import { IDiscountEvent, IFloor, IRow } from "../../interface"
import { Book, DiscountEvent, Floor, ProblemReport, Row } from "../../models"
import { MAX_FLOOR, MAX_ROW } from "../../utils/common"
import verifyRole from "../../middleware/verifyRole"

const router = Router()

// CREATE FLOOR
router.post(
    "/create-floor",
    verifyRole(["admin"]),
    mustHaveFields<IFloor>("index"),
    async (req: Request, res: Response) => {
        try {
            const { index } = req.body
            const floors = await Floor.find({})
            if (floors.length >= MAX_FLOOR) {
                return res.status(400).json({ success: false, message: `Maximum floor is ${MAX_FLOOR}` })
            }
            if (floors.find((floor) => floor.index === index)) {
                return res.status(400).json({ success: false, message: `Floor ${index} already exists` })
            }
            const floor = await Floor.create({
                index
            })
            res.json({ success: true, message: "Floor created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL FLOORS
router.get("/floors", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const floors = await Floor.find({})
        res.json({ success: true, data: floors })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// CREATE ROW
router.post(
    "/create-row",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IRow>("index", "numberOfEmployee"),
    async (req: Request, res: Response) => {
        try {
            const { floor_id } = req.query
            const { index, numberOfEmployee } = req.body
            const rows = await Row.find({})
            if (rows.length >= MAX_ROW) {
                return res.status(400).json({ success: false, message: `Maximum row is ${MAX_ROW}` })
            }
            if (rows.find((row) => row.index === index)) {
                return res.status(400).json({ success: false, message: `Row ${index} already exists` })
            }

            const floor = await Floor.findById(floor_id)
            if (!floor) {
                return res.status(400).json({ success: false, message: `Floor ${floor_id} does not exist` })
            }

            const row = await Row.create({
                index,
                numberOfEmployee,
                floor: floor_id
            })
            await floor.updateOne({
                $push: {
                    rows: row._id
                }
            })
            res.json({ success: true, message: "Row created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL ROWS
router.get("/rows", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const floors = await Row.find({}, undefined, {
            populate: {
                path: "floor",
                select: "-rows"
            }
        })
        res.json({ success: true, data: floors })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// CREATE EVENT
router.post(
    "/create-event",
    verifyRole(["admin"]),
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
                { _id: { $in: discountBooks } },
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

// UPDATE PROBLEM REPORT STATUS
router.put(
    "/update-problem-report-status/:problemReportId",
    verifyRole(["admin"]),
    mustHaveFields("status"),
    async (req: Request, res: Response) => {
        try {
            const { problemReportId } = req.params
            const { status } = req.body
            const problemReport = await ProblemReport.findById(problemReportId)
            if (!problemReport) {
                return res.status(400).json({ success: false, message: "Problem report not found" })
            }
            problemReport.status = status
            await problemReport.save()
            res.json({ success: true, message: "Problem report updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL PROBLEM REPORTS
router.get("/problem-reports", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { status } = req.query
        const problemReports = await ProblemReport.find({
            ...(status && { status })
        })
        res.json({ success: true, data: problemReports })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
