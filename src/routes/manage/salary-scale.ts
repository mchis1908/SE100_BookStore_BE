import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import mustHaveFields from "../../middleware/must-have-field"
import { ISalaryScale } from "../../interface/common/IEmployee"
import doNotAllowFields from "../../middleware/not-allow-field"
import SalaryScale from "../../models/common/SalaryScale"

const router = Router()

// CREATE NEW SALARY SCALE
router.post(
    "/",
    verifyRole(["admin"]),
    mustHaveFields<ISalaryScale>("coefficient"),
    doNotAllowFields<ISalaryScale>("index"),
    async (req: Request, res: Response) => {
        try {
            const { coefficient } = req.body
            const lastSalaryScale = await SalaryScale.findOne().sort({ index: -1 })
            const index = lastSalaryScale ? lastSalaryScale.index + 1 : 1
            const newSalaryScale = await SalaryScale.create({
                coefficient,
                index
            })
            res.json({ success: true, message: "Salary scale created successfully", data: newSalaryScale })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL SALARY SCALES
router.get("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const salaryScales = await SalaryScale.find().sort({ index: 1 })
        res.json({ success: true, data: salaryScales })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// UPDATE SALARY SCALE
router.put(
    "/:salary_scale_id",
    verifyRole(["admin"]),
    mustHaveFields<ISalaryScale>("coefficient"),
    doNotAllowFields<ISalaryScale>("index"),
    async (req: Request, res: Response) => {
        try {
            const { salary_scale_id } = req.params
            const { coefficient } = req.body
            const salaryScale = await SalaryScale.findById(salary_scale_id)
            if (!salaryScale) return res.status(400).json({ success: false, message: "Salary scale does not exist" })
            salaryScale.coefficient = coefficient
            await salaryScale.save()
            res.json({ success: true, message: "Salary scale updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// DELETE SALARY SCALE
router.delete("/:salary_scale_id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { salary_scale_id } = req.params
        const salaryScale = await SalaryScale.findById(salary_scale_id)
        if (!salaryScale) return res.status(400).json({ success: false, message: "Salary scale does not exist" })
        const currentSalaryScaleIndex = salaryScale.index
        await SalaryScale.updateMany(
            { index: { $gt: currentSalaryScaleIndex } },
            {
                $inc: {
                    index: -1
                }
            }
        )

        await salaryScale.deleteOne()
        res.json({ success: true, message: "Salary scale deleted successfully" })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
