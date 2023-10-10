import { Request, Response, Router } from "express"
import verifyRole from "../../middleware/verifyRole"
import mustHaveFields from "../../middleware/must-have-field"
import { EUserRole, ICustomer, IEmployee, IUser, SCHEMA_NAME } from "../../interface"
import doNotAllowFields from "../../middleware/not-allow-field"
import { Customer, Employee, User } from "../../models"
import bcrypt from "bcryptjs"
import Credential from "../../models/common/Credential"

const router = Router()

// CREATE EMPLOYEE ACCOUNT
router.post(
    "/create",
    verifyRole(["admin"]),
    mustHaveFields<IUser<IEmployee>>("email", "phoneNumber", "name", "password"),
    mustHaveFields<IEmployee>("salary", "salaryScale", "salaryCoefficient"),
    async (req: Request, res: Response) => {
        try {
            const { email, password, startDateOfWork, salary, salaryScale, salaryCoefficient, phoneNumber } = req.body

            const user = await User.findOne({ $or: [{ email }, { phoneNumber }] })
            if (user)
                return res
                    .status(400)
                    .json({ success: false, message: "This email/phoneNumber has been used by another" })

            const newEmployee = await Employee.create({
                salary,
                salaryScale,
                salaryCoefficient,
                startDateOfWork
            })
            const newUser = new User({
                ...req.body,
                refPath: SCHEMA_NAME.EMPLOYEES,
                user: newEmployee._id,
                role: EUserRole.EMPLOYEE
            })

            await newUser.save()

            const bcryptPassword = await bcrypt.hash(password, 10)
            const newCredential = new Credential({
                user_id: newUser._id,
                password: bcryptPassword
            })
            await newCredential.save()

            res.json({ success: true, message: "Employee created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT EMPLOYEE INFO
router.put(
    "/edit-info",
    verifyRole(["admin"]),
    doNotAllowFields<IUser>("role", "password"),
    async (req: Request, res: Response) => {
        try {
            const { employee_id } = req.query
            if (!employee_id) return res.status(400).json({ success: false, message: "Missing employee_id" })
            const user = await User.findOne({ user: employee_id })
            if (!user) return res.status(400).json({ success: false, message: "Employee not found" })
            if (user.role !== EUserRole.EMPLOYEE)
                return res.status(400).json({ success: false, message: "This is not an employee" })
            await user.updateOne({
                $set: {
                    ...req.body
                }
            })

            res.json({ success: true, message: "Employee updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT EMPLOYEE SALARY
router.put(
    "/edit-salary",
    verifyRole(["admin"]),
    mustHaveFields<IEmployee>("salary"),
    doNotAllowFields<IEmployee>("startDateOfWork", "seniority"),
    async (req: Request, res: Response) => {
        try {
            const { employee_id } = req.query
            const employee = await Employee.findById(employee_id)
            if (!employee) return res.status(400).json({ success: false, message: "Employee not found" })
            await employee.updateOne({
                $set: {
                    ...req.body
                }
            })
            res.json({ success: true, message: "Employee updated successfully" })
        } catch (error: any) {
            return res.status(500).json({ success: false, message: error.message })
        }
    }
)

export default router
