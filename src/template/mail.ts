import { IVoucher } from "../interface"
import { sendMail } from "../service/mailer"
import dayjs from "dayjs"

const sendVoucher = async (email: string, voucher: IVoucher) => {
    await sendMail({
        to: email,
        subject: `[Bookstore] Voucher for you - ${voucher.name}`,
        html: `
            <h1>Voucher for you</h1>
            <p>Hi, we have a voucher for you</p>
            <p>Voucher code: <b>${voucher.code}</b></p>
            <p>Discount value: <b>${voucher.discountValue}</b></p>
            <p>Expiration date: <b>${dayjs(voucher.expirationDate, "DD-MM-YYYY")}</b></p>
            <p>Have a nice day!</p>
        `
    }).catch((err) => console.log(err))
}

export { sendVoucher }
