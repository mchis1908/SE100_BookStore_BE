import { ERank } from "../interface"

export const APP_NAME = process.env.APP_NAME!
export const MAX_FLOOR = 4
export const MAX_ROW = 12
export const MAX_BOOK_QUANTITY = 100
export const POINT_RANKING = 1000
export const RANK = {
    [ERank.BRONZE]: 1000,
    [ERank.SILVER]: 2000,
    [ERank.GOLD]: 4000,
    [ERank.PLATINUM]: 6000
}
