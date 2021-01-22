const nodemailer = require("nodemailer");
const fs = require("fs");
const pool = require("../routes/db");

let transporter = nodemailer.createTransport({
  service: "gmail", // true for 465, false for other ports
  port: 465,
  pool: true,
  secure: true,
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
});

const salespersonMail = (filterData) => {
  return new Promise((resolve, reject) => {
    let counts = 0;
    let datetime = new Date();
    let i, j;
    datetime.setDate(datetime.getDate() - 1);
    console.log("date heroku", datetime.toISOString());
    let utc = datetime.getTime() + datetime.getTimezoneOffset() * 60000;
    let nd = new Date(utc + 3600000 * +5.5);
    let todayDate = nd.toISOString().slice(0, 10);
    var salesperson = JSON.parse(fs.readFileSync("table/sales.json", "utf8"));
    salesperson.forEach((element, index) => {
      if (element.count <= 0) {
        salesperson[index].count += 1;
      } else {
        var mode = element.count % 7;
        if (mode == 0) {
          let tableStr = "";
          let salespersonSend = [];
          for (i = 0; i < filterData.length; i++) {
            if (filterData[i].salesperson_email == element.HRJ_Email) {
              if (salespersonSend.length < 1) {
                salespersonSend.push(element.HRJ_Email);
              } else {
                for (j = 0; j < salespersonSend.length; j++) {
                  if (salespersonSend[j] == element.HRJ_Email) {
                    let mail = "Already exists";
                  } else {
                    salespersonSend.push(element.HRJ_Email);
                  }
                }
              }
              tableStr += `<tr>
                                <td style="border: 1px solid black;">${filterData[i].dealer_name}</td>
                                <td style="border: 1px solid black;">${filterData[i].dealer_code}</td>
                                <td style="border: 1px solid black;">${filterData[i].dealer_contact}</td>
                                <td style="border: 1px solid black;">${filterData[i].salesperson_name}</td>
                                <td style="border: 1px solid black;">${filterData[i].salesperson_contact}</td>
                                <td style="border: 1px solid black;">${filterData[i].total_dropbox_file_miss_count}</td>
                                <td style="border: 1px solid black;">${filterData[i].business_division}</td>
                                <td style="border: 1px solid black;">${filterData[i].last_seen}</td>
                            </tr>`;
            }
          }
          let mailHtml = `<p>It has been noted that the data from the following dealer are not flowing since ${todayDate}.</p>
                         <br/>
                         <p>List of Dealers are</p>
                         <table style="width:100%; border: 1px solid black;">
                             <tr border: 1px solid black>
                                 <th style="border: 1px solid black;">Dealer Name</th>
                                 <th style="border: 1px solid black;">Dealer Code</th>
                                 <th style="border: 1px solid black;">Dealer Contact Number</th>
                                 <th style="border: 1px solid black;">Sales Person Name</th>
                                 <th style="border: 1px solid black;">Sales Person Number</th>
                                 <th style="border: 1px solid black;">File Miss Count</th>
                                 <th style="border: 1px solid black;">Last Data Received Date</th>
                                 <th style="border: 1px solid black;">Division</th>
                             </tr>
                             ${tableStr}
                         </table>
                         `;
          for (i = 0; i < salespersonSend.length; i++) {
            let emailBody = {
              to: [salespersonSend[i]],
              from: [
                "Connector_DoNotReply< connector.support@prismjohnson.in>",
              ],
              subject: `Escalation for connector data not flowing - Mr.${element.HRJ_Contact_Name}`,
              html: mailHtml,
            };
            transporter.sendMail(emailBody, (err, info) => {
              if (err) {
                console.log(err);
                console.log(`Email not sent to ${emailBody.to}`);
              }
              counts++;
              console.log(info);
            });
          }
          salesperson[index].count = 0;
        } else {
          salesperson[index].count += 1;
        }
      }
    });
    fs.writeFileSync("table/sales.json", JSON.stringify(salesperson, null, 2));
    resolve("Successfully sent " + counts + " mails to salesperson");
  });
};
exports.salespersonMail = salespersonMail;
