import { Request, Response, Router } from "express"
import mustHaveFields from "../../middleware/must-have-field"
import { IBook, IBookCategory, IInvoiceDetail, IPreOrderBook, IPreOrderBookDetail, SCHEMA_NAME } from "../../interface"
import { Book, BookCategory, Invoice, InvoiceDetail, PreOrderBook, PreOrderBookDetail, Row, User } from "../../models"
import doNotAllowFields from "../../middleware/not-allow-field"
import { MAX_BOOK_QUANTITY } from "../../utils/common"
import verifyRole from "../../middleware/verifyRole"
import { EINVOICE_TYPE, IImportInvoice } from "../../interface/book/IInvoice"
import { Types } from "mongoose"
import ImportInvoice from "../../models/book/ImportInvoice"

const router = Router()
const toId = Types.ObjectId

// CREATE CATEGORY
router.post(
    "/create-category",
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
    "/edit-category/:category_id",
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
                        salesPrice: req.body.importPrice * 1.05
                    }
                })
            } else {
                if (quantity > MAX_BOOK_QUANTITY) {
                    return res.status(400).json({ success: false, message: `Maximum quantity is ${MAX_BOOK_QUANTITY}` })
                }
                newBook = await Book.create({
                    ...req.body
                })
            }
            res.status(201).json({ success: true, message: "Book created successfully", newBook })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// EDIT BOOK
// router.put("/edit-book", async (req: Request, res: Response) => {
//     try {
//     } catch (error: any) {
//         res.status(500).json({ success: false, message: error.message })
//     }
// })

// IMPORT BOOK
router.post(
    "/import",
    verifyRole(["admin", "employee"]),
    mustHaveFields("books", "supplier"),
    async (req: Request, res: Response) => {
        try {
            const { books, supplier, note, total } = req.body
            if (books instanceof Array === false) {
                return res.status(400).json({ success: false, message: "Books must be an array" })
            }

            const invoiceDetailsPromise = (books as IBook[]).map(async (book) => {
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

            const invoiceDetails = await Promise.all(invoiceDetailsPromise)
            const newInvoiceDetails = await InvoiceDetail.insertMany(invoiceDetails)

            const importInvoice = await ImportInvoice.create({
                supplier,
                importDate: new Date()
            })

            const invoice = await Invoice.create({
                employee: new toId(req.user_id),
                invoiceDetails: newInvoiceDetails.map((invoiceDetail) => invoiceDetail._id),
                invoice: importInvoice._id,
                note,
                total,
                refPath: SCHEMA_NAME.IMPORT_INVOICES,
                type: EINVOICE_TYPE.IMPORT
            })

            res.json({ success: true, message: "Books imported successfully", invoice })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

// PREORDER BOOK
router.post(
    "/pre-order",
    verifyRole(["admin", "employee"]),
    mustHaveFields<IPreOrderBook>("customer", "deposit", "expirationDate", "preOrderBookDetails"),
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
                        book,
                        quantity
                    })
                    return newPreOrderDetail._id
                }
            )

            const newPreOrderBookDetails = await Promise.all(preOrderBookDetailsPromise)

            const preOrderBook = await PreOrderBook.create({
                employee: new toId(req.user_id),
                preOrderBookDetails: newPreOrderBookDetails,
                ...req.body
            })
            res.status(201).json({ success: true, message: "Pre-order book created successfully", preOrderBook })
        } catch (error: any) {
            res.status(500).json({ success: false, message: error.message })
        }
    }
)

export default router
