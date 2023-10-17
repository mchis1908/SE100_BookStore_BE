import { Request, Response, Router } from "express"
import { Book, BookCategory, DiscountEvent } from "../../models"
import { PaginateOptions } from "mongoose"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
    try {
        const { search_q, page, limit, category } = req.query

        // UPDATE DISCOUNT VALUE IF DISCOUNT EVENT IS OVER
        const discountEvent = await DiscountEvent.findOne({
            startAt: { $lte: new Date() },
            endAt: { $gte: new Date() }
        })
        if (!discountEvent) {
            await Book.updateMany({ discountValue: { $gte: 0 } }, { $set: { discountValue: 0 } }, { new: true })
        }
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            populate: {
                path: "categories",
                select: "name"
            }
        }

        await Book.paginate(
            search_q && search_q !== "0"
                ? {
                      $and: [
                          {
                              $or: [
                                  { name: { $regex: search_q as string, $options: "i" } },
                                  { author: { $regex: search_q as string, $options: "i" } },
                                  { publisher: { $regex: search_q as string, $options: "i" } },
                                  { barcode: { $regex: search_q as string, $options: "i" } }
                              ]
                          },
                          category
                              ? {
                                    categories: { $in: [category] }
                                }
                              : {}
                      ]
                  }
                : {},
            options,
            (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                res.json({ success: true, data: docs, ...rest })
            }
        )
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

router.get("/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const book = await Book.findById(id).populate({
            path: "categories",
            select: "name",
            populate: {
                path: "row",
                select: "-bookList",
                populate: {
                    path: "floor",
                    select: "-rows"
                }
            }
        })
        if (!book) {
            return res.status(404).json({ success: false, message: "Book not found" })
        }
        res.json({ success: true, data: book })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
