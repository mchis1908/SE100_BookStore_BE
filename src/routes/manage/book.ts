import { Request, Response, Router } from "express"
import { PaginateOptions, Types } from "mongoose"
import { IBook, IBookCategory, IInvoiceDetail, IPreOrderBook, IPreOrderBookDetail } from "../../interface"
import mustHaveFields from "../../middleware/must-have-field"
import doNotAllowFields from "../../middleware/not-allow-field"
import verifyRole from "../../middleware/verifyRole"
import { Book, BookCategory, PreOrderBook, PreOrderBookDetail, Row, User } from "../../models"
import { MAX_BOOK_QUANTITY } from "../../utils/common"

const router = Router()
const toId = Types.ObjectId

// CREATE CATEGORY
router.post(
    "/category",
    mustHaveFields<IBookCategory>("name", "row"),
    doNotAllowFields<IBookCategory>("popularity"),
    async (req: Request, res: Response) => {
        try {
            const { name, row } = req.body

            const _row = await Row.findById(row)
            if (!_row) {
                return res.status(400).json({ success: false, message: `Row ${row} does not exist` })
            }

            const category = await BookCategory.create({
                name,
                row
            })

            res.json({ success: true, message: "Category created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT CATEGORY
router.put(
    "/category/:category_id",
    doNotAllowFields<IBookCategory>("popularity"),
    async (req: Request, res: Response) => {
        try {
            const { category_id } = req.params
            if (!category_id) {
                return res.status(400).json({ success: false, message: "Missing category_id" })
            }
            const category = await BookCategory.findById(category_id)
            if (!category) {
                return res.status(400).json({ success: false, message: `Category ${category_id} does not exist` })
            }
            await category.updateOne({
                $set: {
                    ...req.body
                }
            })
            res.json({ success: true, message: "Category updated successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET ALL CATEGORIES
router.get("/category", async (req: Request, res: Response) => {
    try {
        const { page, limit, search_q } = req.query
        const options: PaginateOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            populate: {
                path: "row"
            }
        }
        await BookCategory.paginate(
            search_q
                ? {
                      name: { $regex: search_q as string, $options: "i" }
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

// CREATE BOOK
router.post(
    "/create",
    doNotAllowFields<IBook>("salesPrice"),
    mustHaveFields<IBook>(
        "name",
        "author",
        "barcode",
        "categories",
        "importDate",
        "importPrice",
        "publisher",
        "publishingYear",
        "quantity",
        "translator"
    ),
    async (req: Request, res: Response) => {
        try {
            const { barcode, quantity } = req.body
            const book = await Book.findOne({ barcode })
            let newBook
            if (book) {
                if (book.quantity + quantity > MAX_BOOK_QUANTITY) {
                    return res.status(400).json({
                        success: false,
                        message: `Maximum quantity is ${MAX_BOOK_QUANTITY}. ${
                            MAX_BOOK_QUANTITY - book.quantity
                        } book can be created left`
                    })
                }
                newBook = await book.updateOne({
                    $set: {
                        ...req.body,
                        quantity: book.quantity + req.body.quantity,
                        salesPrice: Number(req.body.importPrice) * 1.05
                    }
                })
            } else {
                if (quantity > MAX_BOOK_QUANTITY) {
                    return res.status(400).json({ success: false, message: `Maximum quantity is ${MAX_BOOK_QUANTITY}` })
                }
                newBook = await Book.create({
                    ...req.body,
                    salesPrice: Number(req.body.importPrice) * 1.05
                })
            }
            res.status(201).json({ success: true, message: "Book created successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT BOOK
router.put("/:book_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params
        if (!book_id) {
            return res.status(400).json({ success: false, message: "Missing book_id" })
        }
        const book = await Book.findOneAndUpdate({ _id: book_id }, { $set: { ...req.body } }, { new: true })
        if (!book) {
            return res.status(400).json({ success: false, message: `Book ${book_id} does not exist` })
        }
        res.json({ success: true, message: "Book updated successfully", data: book })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// IMPORT BOOK
router.post(
    "/import",
    verifyRole(["admin", "employee"]),
    mustHaveFields("books"),
    async (req: Request, res: Response) => {
        try {
            const { books } = req.body
            if (books instanceof Array === false) {
                return res.status(400).json({ success: false, message: "Books must be an array" })
            }

            ;(books as IBook[]).map(async (book) => {
                const { barcode, quantity } = book
                const _book = await Book.findOne({ barcode })
                let newBook
                let newBookId
                if (_book) {
                    if (_book.quantity + quantity > MAX_BOOK_QUANTITY) {
                        return res
                            .status(400)
                            .json({ success: false, message: `Maximum quantity of book is ${MAX_BOOK_QUANTITY}` })
                    }
                    newBook = await _book.updateOne({
                        $set: {
                            ...req.body,
                            quantity: book.quantity + req.body.quantity,
                            salesPrice: req.body.importPrice * 1.05
                        }
                    })
                    newBookId = newBook._id
                } else {
                    if (quantity > MAX_BOOK_QUANTITY) {
                        return res
                            .status(400)
                            .json({ success: false, message: `Maximum quantity is ${MAX_BOOK_QUANTITY}` })
                    }
                    newBook = await Book.create({
                        ...book
                    })
                    newBookId = newBook._id
                }
                return { book: newBookId, quantity } as IInvoiceDetail
            })

            res.json({ success: true, message: "Books imported successfully" })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// PREORDER BOOK
router.post(
    "/pre-order",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IPreOrderBook>("customer", "expirationDate", "preOrderBookDetails"),
    async (req: Request, res: Response) => {
        try {
            const { customer, expirationDate, preOrderBookDetails } = req.body as IPreOrderBook
            const _customer = await User.findById(customer)
            if (!_customer) {
                return res.status(400).json({ success: false, message: `Customer ${customer} does not exist` })
            }
            if (new Date(expirationDate) < new Date()) {
                return res.status(400).json({ success: false, message: `Expiration date must be in the future` })
            }

            const preOrderBookDetailsPromise = (preOrderBookDetails as IPreOrderBookDetail[]).map(
                async ({ book, quantity }) => {
                    const newPreOrderDetail = await PreOrderBookDetail.create({
                        book: new toId(book.toString()),
                        quantity
                    })
                    return newPreOrderDetail._id
                }
            )

            const newPreOrderBookDetails = await Promise.all(preOrderBookDetailsPromise)
            const preOrderBook = await PreOrderBook.create({
                ...req.body,
                employee: new toId(req.user_id),
                preOrderBookDetails: newPreOrderBookDetails
            })
            res.status(201).json({ success: true, message: "Pre-order book created successfully", preOrderBook })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET PREORDER BOOKS
router.get("/pre-order", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const options: PaginateOptions = {
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10
        }
        await PreOrderBook.paginate({}, options, (err, result) => {
            if (err) return res.status(500).json({ success: false, message: err.message })
            const { docs, ...rest } = result
            res.json({ success: true, data: docs, ...rest })
        })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// GET CUSTOMER's PREORDER BOOKS
router.get(
    "/pre-order/customer/:customer_id",
    verifyRole(["admin", "employee"]),
    async (req: Request, res: Response) => {
        try {
            const { customer_id } = req.params
            const options: PaginateOptions = {
                page: Number(req.query.page) || 1,
                limit: Number(req.query.limit) || 10
            }
            await PreOrderBook.paginate({ customer: customer_id }, options, (err, result) => {
                if (err) return res.status(500).json({ success: false, message: err.message })
                const { docs, ...rest } = result
                res.json({ success: true, data: docs, ...rest })
            })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// GET PREORDER BOOK BY ID
router.get("/pre-order/:id", verifyRole(), async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const preOrderBook = await PreOrderBook.findById(id, undefined, {
            populate: {
                path: "preOrderBookDetails",
                populate: {
                    path: "book",
                    select: "name author publisher"
                }
            }
        })
        res.json({ success: true, data: preOrderBook })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

// DELETE BOOK
router.delete("/:book_id", verifyRole(["admin", "employee"]), async (req: Request, res: Response) => {
    try {
        const { book_id } = req.params
        if (!book_id) {
            return res.status(400).json({ success: false, message: "Missing book_id" })
        }
        const book = await Book.findById(book_id)
        if (!book) {
            return res.status(400).json({ success: false, message: `Book ${book_id} does not exist` })
        }
        await book.deleteOne()
        res.json({ success: true, message: "Book deleted successfully" })
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message })
    }
})

export default router
