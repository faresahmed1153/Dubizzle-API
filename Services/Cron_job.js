import schedule from "node-schedule";
import moment from "moment";
import path from "path";
import productModel from "../DB/Models/Products.js";
import userModel from "../DB/Models/User.js";
import { createProductsTable } from "./pdf.js";
import sendEmail from "./SendEmail.js";

function cornJobs() {
  const sendCreatedProductsPdf = async () => {
    const today = moment().format("YYYY-MM-DD");

    const products = await productModel
      .find({
        createdAt: { $gte: today },
        IsDeleted: false,
      })
      .select("_id Product_title Product_desc Product_price");
    console.log({ products: products });

    const admins = await userModel
      .find({
        IsDeleted: false,
        Confirmed: true,
        Blocked: false,
        role: "Admin",
      })
      .select("-_id email");
    console.log({ admins: admins });

    const pdfPath = path.join(__dirname, `../uploads/PDFs/Products`);
    const pdfName = `${today}_products.pdf`;

    if (products.length > 0 && admins.length > 0) {
      createProductsTable({ items: products }, pdfPath, pdfName); // create the pdf by its prodcuts
      const adminsEmails = admins.map((admin) => admin.email); // get array of admin's emails only not array of object
      console.log({ adminsEmails: adminsEmails });
      const adminsEmailsWithComma = adminsEmails.join(","); // seperate emails by comma to send the pdf for  each email of them
      console.log({ adminsEmailsWithComma: adminsEmailsWithComma });
      sendEmail(adminsEmailsWithComma, "<p>Daily report of created products</p>", {
        path: `${pdfPath}/${pdfName}`,
      });
    } else {
      console.log(`No products created today`);
    }
  };
  schedule.scheduleJob("59 59 23 * * *", sendCreatedProductsPdf);
}

export default cornJobs;
