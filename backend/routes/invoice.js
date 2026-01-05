import express from "express";
import InvoiceService from "../services/invoicePDF.service.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// http://localhost:3000/invoice/test/1
router.get('/test/:id', async (req, res) => {
    try {
        const invoiceID = req.params.id;

        const pdfBuffer = await InvoiceService.generateInvoicePdf(invoiceID);

        const fileName = `Rechnung_${invoiceID}.pdf`;
        const filePath = path.join(process.cwd(), fileName);

        fs.writeFileSync(filePath, pdfBuffer);

        console.log(`PDF saved in: ${filePath}`);
        
        res.send(`PDF created: ${fileName}`);

    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error: " + error.message);
    }
});

export default router;