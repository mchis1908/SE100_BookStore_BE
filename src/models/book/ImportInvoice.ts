import { Schema, model } from "mongoose"
import { IImportInvoice } from "../../interface/book/IInvoice"
import { SCHEMA_NAME } from "../../interface"

const ImportInvoice = new Schema<IImportInvoice>({
    importDate: {
        type: Date,
        default: Date.now
    },
    supplier: {
        type: String,
        required: true
    }
})

export default model<IImportInvoice>(SCHEMA_NAME.IMPORT_INVOICES, ImportInvoice, SCHEMA_NAME.IMPORT_INVOICES)
