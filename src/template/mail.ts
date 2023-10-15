import { IBook, IDiscountEvent, IExpense, IInvoice, IInvoiceDetail, IUser, IVoucher } from "../interface"
import { sendMail } from "../service/mailer"
import moment from "moment"
import emailContentProvider from "./provider"
import { ISalaryScale } from "../interface/common/IEmployee"

const sendVerifyEmail = async ({ email, verifyToken }: { email: string; verifyToken: string }) => {
    sendMail({
        to: email as string,
        subject: "[Bookstore] Verify your email",
        html: emailContentProvider({
            title: "Verify your email",
            children: `
                <p>
                    Thanks for signing up for Bookstore! We're excited to have you as an
                    early user.
                </p>
                <p>
                    Before we get started, we just need to confirm that this is you. Click
                    the button below to verify your email address:
                </p>
                <a
                    href="${process.env.URL}/auth/verify-email?email=${email}&token=${verifyToken}"
                    style="
                    background-color: #2563eb;
                    color: #fff;
                    padding: 0.5rem 1rem;
                    border-radius: 4px;
                    text-decoration: none;
                    "
                    >Verify Email</a
                >
                <p>
                    If you didn't sign up for Bookstore, you can safely ignore this email.
                </p>
            `
        })
    })
}

const resetPassword = async ({ email, resetPassword }: { email: string; resetPassword: string }) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] Reset password`,
        html: emailContentProvider({
            title: "Reset password",
            children: `
                <p>We heard that you lost your password. Sorry about that!</p>
                <p>
                    But don't worry! You can use this password to login to your account:
                    <b>${resetPassword}</b>
                </p>
            `
        })
    })
}

const sendVoucher = async ({ email, voucher }: { email: string; voucher: IVoucher }) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] Voucher for you - ${voucher.name}`,
        html: emailContentProvider({
            title: "Voucher for you",
            children: `
                <p>Thanks for using our service</p>
                <p>We have a voucher for you</p>
                <p>Voucher code: <b>${voucher.code}</b></p>
                <p>Discount value: <b>${voucher.discountValue * 100}%</b></p>
                <p>Expiration date: <b>${moment(voucher.expirationDate).format("DD-MM-YYYY hh:mm:ss")}</b></p>
            `
        })
    })
}

const sendVoucherExpired = async (email: string, voucher: IVoucher) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] Voucher expired - ${voucher.name}`,
        html: emailContentProvider({
            title: "Voucher expired",
            children: `
                <p>Thanks for using our service</p>
                <p>Your voucher has expired</p>
                <p>Voucher code: <b>${voucher.code}</b></p>
                <p>Discount value: <b>${voucher.discountValue * 100}%</b></p>
                <p>Expiration date: <b>${moment(voucher.expirationDate).format("DD-MM-YYYY hh:mm:ss")}</b></p>
            `
        })
    })
}

const sendNewEvent = async (email: string, event: IDiscountEvent) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] New event - ${event.name}`,
        html: emailContentProvider({
            title: "New event",
            children: `
                <p>Thanks for using our service</p>
                <p>We have a new event for you</p>
                <p>Event name: <b>${event.name}</b></p>
                <p>Discount value: <b>${event.eventDiscountValue * 100}%</b></p>
                <p>Start date: <b>${moment(event.startAt).format("DD-MM-YYYY hh:mm:ss")}</b></p>
                <p>End date: <b>${moment(event.endAt, "DD-MM-YYYY hh:mm:ss")}</b></p>
            `
        })
    })
}

const sendNewAccountCreated = async ({ email, user }: { email: string; user: IUser }) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] New account created`,
        html: emailContentProvider({
            title: "New account created",
            children: `
                <p>Thanks for using our service</p>
                <p>We have created an account for you</p>
                <p>Email: <b>${user.email}</b></p>
                <p>Phone number: <b>${user.phoneNumber}</b></p>
                <p>Password: <b>${user.password}</b></p>
            `
        })
    })
}

const sendSalaryChange = async ({
    email,
    oldSalary,
    newSalary
}: {
    email: string
    oldSalary: number
    newSalary: number
}) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] Salary changed`,
        html: emailContentProvider({
            title: "Salary changed",
            children: `
                <p>Your salary has changed</p>
                <p>Old salary: <b>${oldSalary}</b></p>
                <p>New salary: <b>${newSalary}</b></p>
            `
        })
    })
}

const sendSalaryScaleChange = async ({
    email,
    oldSalaryScale,
    newSalaryScale
}: {
    email: string
    oldSalaryScale: ISalaryScale
    newSalaryScale: ISalaryScale
}) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] Salary scale changed`,
        html: emailContentProvider({
            title: "Salary scale changed",
            children: `
                <p>Your salary scale has changed</p>
                <p>Old salary scale: <b>${oldSalaryScale.coefficient}</b></p>
                <p>New salary scale: <b>${newSalaryScale.coefficient}</b></p>
            `
        })
    })
}

const sendOrderInvoice = async ({ email, invoice }: { email: string; invoice: IInvoice }) => {
    let temporaryTotalPrice = 0
    let temporaryDiscountPrice = 0
    let eventDiscountPrice = 0
    const customer = invoice.customer as IUser
    const employee = invoice.employee as IUser
    await sendMail({
        to: email,
        subject: `[Bookstore] Invoice`,
        html: emailContentProvider({
            title: "Invoice #" + invoice._id,
            children: `
                <div>
                    <h2>Order of ${customer.name}</h2>
                    <p>
                    <b>Address:</b> ${customer.address}<br />
                    <b>Email:</b> ${customer.email}<br />
                    <b>Phone number: ${customer.phoneNumber}</b>
                    </p>
                    <p><b>Invoice Date:</b> ${moment(invoice.createdAt).format("llll")}</p>
                    <p><b>Staff:</b> ${employee.name} - ${employee.phoneNumber}</p>
                </div>
                <table style="width: 100%">
                    <thead style="background-color: #f7f7f7; text-align: right">
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit price</th>
                        <th>Subtotal</th>
                    </tr>
                    </thead>
                    <tbody style="text-align: right">
                    ${(invoice.invoiceDetails as IInvoiceDetail[])
                        .map((invoiceDetail: IInvoiceDetail) => {
                            const book = invoiceDetail.book as IBook
                            const quantity = invoiceDetail.quantity
                            const subtotal = book.salesPrice * quantity
                            temporaryTotalPrice += subtotal
                            eventDiscountPrice += subtotal * (invoice.eventDiscountValue || 0)
                            return `<tr>
                        <td>${book.name}</td>
                        <td>${quantity}</td>
                        <td>${book.salesPrice}</td>
                        <td>${subtotal}</td>
                    </tr>`
                        })
                        .join("")}
                    </tbody>
                    <tfoot style="text-align: right">
                    <tr style="background-color: #f7f7f7; font-weight: bold">
                        <td colspan="3" style="text-align: right">Temporary total price</td>
                        <td>${temporaryTotalPrice}</td>
                    </tr>
                    ${
                        invoice.vouchers.length > 0
                            ? `<tr>
                        <td colspan="4" style="text-align: left">
                        Vouchers
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right">
                        <table style="width: 100%">
                            <thead style="background-color: #f7f7f7;">
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Discount value</th>
                            </tr>
                            </thead>
                            <tbody>
                            ${(invoice.vouchers as IVoucher[])
                                .map((voucher: IVoucher) => {
                                    temporaryDiscountPrice += temporaryTotalPrice * voucher.discountValue
                                    return `<tr>
                                <td>${voucher.name}</td>
                                <td>${voucher.code}</td>
                                <td>${voucher.discountValue * 100}%</td>
                            </tr>`
                                })
                                .join("")}
                            </tbody>
                        </table>
                        </td>
                    </tr>`
                            : ""
                    }
                    ${
                        invoice.eventDiscountValue
                            ? `<tr>
                        <td colspan="4" style="text-align: left">
                        Discount event
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4" style="text-align: right">
                        <table style="width: 100%">
                            <thead style="background-color: #f7f7f7;">
                            <tr>
                                <th>Discount value</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>${invoice.eventDiscountValue * 100}%</td>
                            </tr>
                            </tbody>
                        </table>
                        </td>
                    </tr>`
                            : ""
                    }
                    ${
                        invoice.vouchers.length > 0 || invoice.eventDiscountValue
                            ? `<tr style="background-color: #f7f7f7; font-weight: bold">
                        <td colspan="3" style="text-align: right">Discount price</td>
                        <td>${temporaryDiscountPrice} + ${eventDiscountPrice}</td>
                    </tr>`
                            : ""
                    }
                    <tr style="background-color: #f7f7f7; font-weight: bold">
                        <td colspan="3" style="text-align: right">Total</td>
                        <td>${temporaryTotalPrice - temporaryDiscountPrice - eventDiscountPrice}</td>
                    </tr>
                    </tfoot>
                </table>
                <cite>Note: ${invoice.note || "Nothing"}</cite>
            `
        })
    })
}

export {
    sendVoucher,
    resetPassword,
    sendVerifyEmail,
    sendVoucherExpired,
    sendNewEvent,
    sendNewAccountCreated,
    sendSalaryChange,
    sendSalaryScaleChange,
    sendOrderInvoice
}
