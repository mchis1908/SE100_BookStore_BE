import { Request, Response, Router } from "express"
import verifyRole from "../../../middleware/verifyRole"
import mustHaveFields from "../../../middleware/must-have-field"
import { EUserRole, ICustomer, IEmployee, IUser, SCHEMA_NAME } from "../../../interface"
import doNotAllowFields from "../../../middleware/not-allow-field"
import { Customer, Employee, User } from "../../../models"
import bcrypt from "bcryptjs"
import Credential from "../../../models/common/Credential"
import { PaginateOptions } from "mongoose"
import SalaryScale from "../../../models/common/SalaryScale"
import { sendNewAccountCreated, sendSalaryChange, sendSalaryScaleChange } from "../../../template/mail"
import { ISalaryScale } from "../../../interface/common/IEmployee"

const router = Router()

// CREATE EMPLOYEE ACCOUNT
router.post(
    "/create",
    verifyRole(["admin"]),
    mustHaveFields<IUser<IEmployee>>("email", "phoneNumber", "name", "password"),
    mustHaveFields<IEmployee>("salary", "salaryScale"),
    async (req: Request, res: Response) => {
        try {
            const { email, password, startDateOfWork, salary, salaryScale, phoneNumber } = req.body

            const user = await User.findOne({ $or: [{ email }, { phoneNumber }] })
            if (user)
                return res
                    .status(400)
                    .json({ success: false, message: "This email/phoneNumber has been used by another" })

            const newEmployee = await Employee.create({
                salary,
                salaryScale,
                startDateOfWork
            })
            const newUser = new User({
                ...req.body,
                refPath: SCHEMA_NAME.EMPLOYEES,
                user: newEmployee._id,
                role: EUserRole.EMPLOYEE
            })

            await newUser.save()

            newUser.password = password

            const bcryptPassword = await bcrypt.hash(password, 10)
            const newCredential = new Credential({
                user_id: newUser._id,
                password: bcryptPassword
            })
            await newCredential.save()

            sendNewAccountCreated({ email: newUser.email, user: newUser })

            res.json({ success: true, message: "Employee created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT EMPLOYEE
router.put("/:employee_id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { employee_id } = req.params
        if (!employee_id) return res.status(400).json({ success: false, message: "Missing employee_id" })
        const user = await User.findById(employee_id)
        if (!user) return res.status(400).json({ success: false, message: "Employee not found" })
        if (user.role !== EUserRole.EMPLOYEE)
            return res.status(400).json({ success: false, message: "This is not an employee" })
        const employee = await Employee.findById(user.user).populate("salaryScale")
        if (!employee) return res.status(400).json({ success: false, message: "Employee not found" })
        const { salary, salaryScale } = req.body
        if (salary) {
            if (employee.salary != salary) {
                sendSalaryChange({ email: user.email, oldSalary: employee.salary, newSalary: salary })
            }
        }
        if (salaryScale) {
            const salaryScaleObj = await SalaryScale.findById(salaryScale)
            if (!salaryScaleObj) return res.status(400).json({ success: false, message: "Salary scale not found" })
            if (salaryScale != employee.salaryScale) {
                sendSalaryScaleChange({
                    email: user.email,
                    oldSalaryScale: employee.salaryScale as ISalaryScale,
                    newSalaryScale: salaryScaleObj
                })
            }
        }
        await employee.updateOne({
            $set: {
                ...req.body
            }
        })
        await user.updateOne({
            $set: {
                ...req.body
            }
        })

        res.json({ success: true, message: "Employee updated successfully" })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET ALL EMPLOYEES
router.get("/", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { page, limit, search_q, isDeleted, sort, sort_by } = req.query
        const sortByArr = sort_by?.toString().split(",") || []
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            populate: {
                path: "user",
                populate: {
                    path: "salaryScale"
                }
            },
            sort: {
                ...(sort_by
                    ? Object.fromEntries(sortByArr.map((item) => [item, !sort || sort === "asc" ? 1 : -1]))
                    : {})
            }
        }
        await User.paginate(
            {
                role: EUserRole.EMPLOYEE,
                isDeleted: isDeleted !== undefined ? (isDeleted === "true" ? true : false) : { $exists: true },
                $or: search_q
                    ? [
                          { name: { $regex: search_q as string, $options: "i" } },
                          {
                              "user.salaryScale.coefficient": { $regex: search_q as string, $options: "i" }
                          }
                      ]
                    : [{}]
            },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// CHANGE EMPLOYEE SALARY SCALE
router.put("/change-salary-scale/:employee_id", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { employee_id } = req.params
        const { salaryScale } = req.body
        const employee = await Employee.findById(employee_id)
        if (!employee) return res.status(400).json({ success: false, message: "Employee not found" })
        await employee.updateOne({
            $set: {
                salaryScale
            }
        })
        res.json({ success: true, message: "Employee updated successfully" })
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

// GET ALL SALARY
router.get("/salary", verifyRole(["admin"]), async (req: Request, res: Response) => {
    try {
        const { page, limit, search_q, isDeleted, sort, sort_by } = req.query
        const sortByArr = sort_by?.toString().split(",") || []
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            populate: {
                path: "user",
                populate: {
                    path: "salaryScale"
                }
            },
            sort: {
                ...(sort_by
                    ? Object.fromEntries(sortByArr.map((item) => [item, !sort || sort === "asc" ? 1 : -1]))
                    : {})
            }
        }
        await User.paginate(
            {
                isDeleted: isDeleted !== "" ? (isDeleted === "true" ? true : false) : { $exists: true },
                $or: search_q ? [{ name: { $regex: search_q as string, $options: "i" } }] : [{}],
                role: EUserRole.EMPLOYEE
            },
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message })
    }
})

export default router
