import { Express } from "express"
import authRouter from "./auth"
import rootRouter from "./root"
import userRouter from "./user"

import {
    manageBookRouter,
    manageBookstoreRouter,
    manageCustomerRouter,
    manageEmployeeRouter,
    manageOrderRouter,
    manageVoucherRouter,
    salaryScale,
    trashRouter
} from "./manage"
import { clientBookRouter, customerRouter, invoiceRouter } from "./client"

export default function getRoutes(app: Express) {
    app.use("/api", rootRouter)
    app.use("/api/auth", authRouter)
    app.use("/api/user", userRouter)
    app.use("/api/manage/employee", manageEmployeeRouter)
    app.use("/api/manage/customer", manageCustomerRouter)
    app.use("/api/manage/bookstore", manageBookstoreRouter)
    app.use("/api/manage/book", manageBookRouter)
    app.use("/api/manage/order", manageOrderRouter)
    app.use("/api/manage/voucher", manageVoucherRouter)
    app.use("/api/manage/trash", trashRouter)
    app.use("/api/manage/salary-scale", salaryScale)

    app.use("/api/book", clientBookRouter)
    app.use("/api/invoice", invoiceRouter)
    app.use("/api/customer", customerRouter)
}
