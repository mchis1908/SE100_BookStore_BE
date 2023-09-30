import { Request, Response, Router } from "express"
import { SCHEMA_NAME } from "../../interface"
import verifyRole from "../../middleware/verifyRole"
import { Invoice } from "../../models"
import { Types } from "mongoose"

const router = Router()
const toId = Types.ObjectId

// GET INVOICES BY TYPE
router.get("/", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { type } = req.query
        const types = [SCHEMA_NAME.IMPORT_INVOICES, SCHEMA_NAME.USER_INVOICES] as string[]
        if (!types.includes(type as string)) {
            return res.status(400).json({ success: false, message: "type is not valid" })
        }
        const invoices = await Invoice.find({
            refPath: type
        }).populate([
            {
                path: "employee",
                select: "name"
            },
            {
                path: "invoice"
            },
            {
                path: "customer",
                select: "name"
            }
        ])
        res.json({ success: true, data: invoices })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET CUSTOMER's INVOICES
router.get("/customer", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { customer_id } = req.query
        if (!customer_id) {
            return res.status(400).json({ success: false, message: "customer_id is required" })
        }
        const invoices = await Invoice.find({
            customer: new toId(customer_id as string)
        })
            .populate([
                {
                    path: "employee",
                    select: "name"
                },
                {
                    path: "invoice"
                }
            ])
            .select("-customer")
        res.json({ success: true, data: invoices })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET INVOICE BY ID
router.get("/:id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate("employee", "name")
        if (!invoice) {
            return res.status(404).json({ success: false, message: "invoice not found" })
        }
        const refPath = invoice.refPath
        let populateInvoice
        if (refPath === SCHEMA_NAME.IMPORT_INVOICES) {
            populateInvoice = await invoice.populate("invoice")
        } else {
            populateInvoice = await invoice.populate([
                {
                    path: "invoice",
                    populate: [
                        {
                            path: "vouchers",
                            select: "name discountValue"
                        }
                    ]
                },
                {
                    path: "customer",
                    select: "name"
                }
            ])
        }
        res.json({ success: true, data: populateInvoice })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
