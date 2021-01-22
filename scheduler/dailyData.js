const nodemailer = require("nodemailer");
const fs = require('fs');
const pool = require("../routes/db");
let transporter = nodemailer.createTransport({
    service: "gmail", // true for 465, false for other ports
    port: 465,
    pool: true,
    secure: true,
    auth: {
        user: process.env.EMAIL, // generated ethereal user
        pass: process.env.PASSWORD // generated ethereal password
    }
})

const dailyData = (filterData) => {
    return new Promise((resolve, reject) => {
        let datetime = new Date();
        datetime.setDate(datetime.getDate() - 1);
        console.log("date heroku", datetime.toISOString())
        let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
        let nd = new Date(utc + (3600000 * +5.5));
        let todayDate = nd.toISOString().slice(0, 10);
        let tableStr = '';
        filterData.forEach((dealer) => {
            tableStr += `<tr>
                                <td style="border: 1px solid black;">${dealer.dealer_name}</td>
                                <td style="border: 1px solid black;">${dealer.dealer_code}</td>
                                <td style="border: 1px solid black;">${dealer.dealer_contact}</td>
                                <td style="border: 1px solid black;">${dealer.salesperson_name}</td>
                                <td style="border: 1px solid black;">${dealer.salesperson_contact}</td>
                            </tr>`
        })
        let mailHtml = `<p>It has been noted that the data from the following dealer are uploaded today.</p>
                         <br/>
                         <p>List of Dealers are</p>
                         <table style="width:100%; border: 1px solid black;">
                             <tr border: 1px solid black>
                                 <th style="border: 1px solid black;">Dealer Name</th>
                                 <th style="border: 1px solid black;">Dealer Code</th>
                                 <th style="border: 1px solid black;">Dealer Contact Number</th>
                                 <th style="border: 1px solid black;">Sales Person Name</th>
                                 <th style="border: 1px solid black;">Sales Person Number</th>
                             </tr>
                             ${tableStr}
                         </table>
                         `
        let emailBody = {
            to: ["pratiksha.chavan@goldrattgroup.com"],
            from: ['Connector_DoNotReply< connector.support@prismjohnson.in>', '<dasnil500@gmail.com>', '<support@edunomics.in>'],
            subject: `Today's data record`,
            html: mailHtml
        }
        transporter.sendMail(emailBody, (err, info) => {
            if (err) {
                console.log(err)
                console.log(`Email not sent to ${
                            emailBody.to
                                }`);
            }
            console.log(info)
        })
        resolve("Success");
    })
}
exports.dailyData = dailyData;