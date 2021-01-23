const nodemailer = require("nodemailer");
const fs = require("fs");

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
var i;
const sendMailToDealer = (filterData) => {
  let remainder = filterData.length % 25;
  if (remainder == 0) {
    var arraySize = filterData.length / 25;
  } else {
    var size = filterData.length / 25;
    var arraySize = Math.trunc(size) + 1;
  }
  return new Promise((resolve, reject) => {
    // let datetime = new Date();
    let emails = [];
    let data = [];
    let tableStr = "";
    let config = require("../routes/Admin_Data/dealers/config.json");
    let testCount = 0;
    filterData.forEach((element) => {
      let datetime = new Date(
        Date.now() - element.dropbox_file_miss_count * 24 * 60 * 60 * 1000
      );
      // datetime.setDate(datetime.getDate() - 1);
      console.log("date heroku", datetime.toISOString());
      let utc = datetime.getTime() + datetime.getTimezoneOffset() * 60000;
      let nd = new Date(utc + 3600000 * +5.5);
      let todayDate = nd.toISOString().slice(0, 10);
      let count = element.dropbox_file_miss_count + 1;
      let e;
      //   e = element.dropbox_file_miss_count % config.file_miss_count;
      if (element.total_dropbox_file_miss_count >= 7) {
        testCount += 1;
        emails.push({
          to: element.dealer_email,
          from: "Connector_DoNotReply< connector.support@prismjohnson.in>",
          cc: element.salesperson_email,
          subject: `Distributor Name – ${element.dealer_code}  ${element.dealer_name} – HRJ's Symphony Connector Data Not Received`,
          html: `<p>Dear User,</p>
                    <br/>
                    <p>It has been noted that the data from connector is not flowing since <b>${
            element.last_seen.split("-")[0]
            }/${element.last_seen.split("-")[1]}/${
            element.last_seen.split("-")[2]
            }</b>. Please note the following possible reasons and correct them accordingly.</p>
                    <br/>
                    <p><ol><li>Computer and / or internet is not on while transmitting the data. Resolution: Ensure that the computer and internet is on at the scheduled time of transmitting data</li><li>Latest stock file is not available at the target folder. Resolution: Ensure that daily stock file in the prescribed format with latest data is kept at the target folder <b>\\desktop\\connector</b></li><li>Name of file should be Status-summary-YYYY-MM-DD-Dealer/distributor/vendor name For example: Status-summary-2020-05-18-XYZ Enterprise.</li></ol></p>
                    <p>If above things are in place please contact HRJ's Symphony Helpdesk for resolving the issue</p>
                    <p>Have a pleasant Day!<br>HRJ’s Symphony Connector<br>Please do not reply - this Email was generated automatically by Symphony</p>`,
        });
      }
      tableStr += `<tr>
              <td style="border: 1px solid black;">${element.dealer_name}</td>
              <td style="border: 1px solid black;">${element.dealer_code}</td>
              <td style="border: 1px solid black;">${element.dealer_contact}</td>
              <td style="border: 1px solid black;">${element.salesperson_name}</td>
              <td style="border: 1px solid black;">${element.salesperson_contact}</td>
              </tr>`;
    });
    // console.log("filter data", filterData.length);
    // console.log("count 4", testCount);
    // console.log(emails);
    console.log(
      "***************************************************************************"
    );
    // emails.forEach((email) => {
    let flag = 0;
    let initValue = 0;
    let finalValue = 0;
    let count = 0;
    for (i = 0; i < 25; i++) {
      if (emails[i]) {
        transporter.sendMail(emails[i], (err, info) => {
          if (err) {
            // console.log(err)
            console.log(`Email not sent to ${emails[i]}`);
          }
          console.log(info);
        });
        if (i == 24) {
          count = 25;
          console.log(
            "Hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii"
          );
          initValue = i + 1;
          flag = 1;
        }
      } else {
        console.log("All mails are sent");
      }
    }
    if (flag == 1) {
      flag = 0;
      if (emails[initValue]) {
        finalValue = initValue + 25;
        let newVal = finalValue - 1;
        for (i = initValue; i < finalValue; i++) {
          if (emails[i]) {
            transporter.sendMail(emails[i], (err, info) => {
              if (err) {
                // console.log(err)
                console.log(`Email not sent to ${emails[i]}`);
              }
              count++;
              console.log(info);
            });
            if (i == newVal) {
              initValue = i + 1;
              finalValue = initValue + 25;
              flag = 1;
            }
          } else {
            console.log("All mails are sent");
            break;
          }
        }
      } else {
        console.log("All mails are sent");
      }
      // })
    }
    resolve("Successfully sent " + count + " mails to dealers");
  });
};
exports.sendMailToDealer = sendMailToDealer;
