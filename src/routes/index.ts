import { Express } from "express"
import authRouter from "./auth"
import rootRouter from "./root"
import userRouter from "./user"
import manageEmployeeRouter from "./manage/employee"
import manageCustomerRouter from "./manage/customer"
import manageBookstoreRouter from "./manage/bookstore"
import manageBookRouter from "./manage/book"
import manageOrderRouter from "./manage/order"
import manageVoucherRouter from "./manage/voucher"

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
}
