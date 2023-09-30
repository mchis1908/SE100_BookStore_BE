import { Request, Response, Router } from "express"
import { Book, BookCategory } from "../../models"
import { IBook } from "../../interface"

const router = Router()

router.get("/", async (req: Request, res: Response) => {
    try {
        const books = await Book.find({}).populate("categories", "name")
        res.status(200).json({ success: true, data: books })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

router.get("/search", async (req: Request, res: Response) => {
    try {
        const { q, filter, from, to } = req.query
        const queries = ["category", "author", "name", "salesPrice"]
        if (!filter) return res.status(400).json({ success: false, message: "Missing filter" })
        if (!queries.includes(filter.toString()))
            return res.status(400).json({ success: false, message: "Invalid filter" })
        if (filter !== "salesPrice" && !q) return res.status(400).json({ success: false, message: "Missing q" })
        if (filter === "salesPrice" && (!from || !to))
            return res.status(400).json({ success: false, message: "Missing from or to" })
        let books = [] as IBook[]
        if (filter === "category") {
            // FILTER BY category
            books = await Book.find({
                categories: {
                    $in: await BookCategory.find({ name: { $regex: q as string, $options: "i" } }).select("_id")
                }
            }).populate("categories", "name")
        } else {
            // FILTER BY author, name, salesPrice
            books = await Book.find(
                filter === "salesPrice"
                    ? {
                          salesPrice: {
                              $gte: parseInt(from as string),
                              $lte: parseInt(to as string)
                          }
                      }
                    : {
                          [filter.toString()]: { $regex: q as string, $options: "i" }
                      }
            ).populate("categories", "name")
        }
        res.status(200).json({ success: true, data: books })
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
