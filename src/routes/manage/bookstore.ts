import { Request, Response, Router } from "express"
import mustHaveFields from "../../middleware/must-have-field"
import { IFloor, IRow } from "../../interface"
import { Floor, Row } from "../../models"
import { MAX_FLOOR, MAX_ROW } from "../../utils/common"

const router = Router()

// CREATE FLOOR
router.post("/create-floor", mustHaveFields<IFloor>("index"), async (req: Request, res: Response) => {
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
})

// CREATE ROW
router.post("/create-row", mustHaveFields<IRow>("index", "numberOfEmployee"), async (req: Request, res: Response) => {
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
        res.json({ success: true, message: "Row created successfully" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
