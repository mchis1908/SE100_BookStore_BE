import { IVoucher } from "../interface"
import { sendMail } from "../service/mailer"
import dayjs from "dayjs"
import emailContentProvider from "./provider"

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
                <p>Discount value: <b>${voucher.discountValue}</b></p>
                <p>Expiration date: <b>${dayjs(voucher.expirationDate, "DD-MM-YYYY hh:mm:ss")}</b></p>
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
                <p>Discount value: <b>${voucher.discountValue}</b></p>
                <p>Expiration date: <b>${dayjs(voucher.expirationDate, "DD-MM-YYYY hh:mm:ss")}</b></p>
            `
        })
    })
}

export { sendVoucher, resetPassword, sendVerifyEmail, sendVoucherExpired }
