let Client = require("ssh2-sftp-client");
let sftp = new Client();
const scheduler = require("node-schedule");
const pool = require("../routes/db");
const nodemailer = require("nodemailer");
const fs = require("fs");
const mailToDealer = require("./mailToDealer");
const consolidatedMail = require("./consolidatedMail");
const salespersonMail = require("./salespersonMail");
const dailyData = require("./dailyData");
require("dotenv").config();
const stringify = require("csv-stringify");
// const csv = require('csvtojson');
// import stringify from 'csv-stringify';
var userInfo, i;
let rule = new scheduler.RecurrenceRule();
rule.tz = "Asia/Kolkata";
rule.hour = 12;
rule.minute = 44;
rule.second = 00;
rule.dayOfWeek = new scheduler.Range(0, 6);
console.log(new Date());
let transporter = nodemailer.createTransport({
  service: "gmail", // true for 465, false for other ports
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
});
// /^((?!2020-06-23).)*$/
console.log("file called");
const dailyJob = scheduler.scheduleJob(rule, () => {
  sftp
    .connect({
      host: "123.108.50.210",
      port: "9222",
      username: "goldrattuser",
      password: "symph0ny@g0Ld",
    })
    .then(() => {
      let datetime = new Date();
      datetime.setDate(datetime.getDate() - 1);
      console.log("date heroku", datetime.toISOString());
      let utc = datetime.getTime() + datetime.getTimezoneOffset() * 60000;
      let nd = new Date(utc + 3600000 * +5.5);
      var todayDate = nd.toISOString().slice(0, 10);
      return sftp.list("/home/goldrattuser/Archive", `*${todayDate}*`);
    })
    .then(async (data) => {
      let sliceData = [];
      let countData = [];
      for (i = 0; i < data.length; i++) {
        let dealerName = data[i].name.split("_")[1];
        sliceData.push(dealerName);
      }

      let sortData = sliceData.sort();
      var obj = JSON.parse(fs.readFileSync("table/user_info.json", "utf8"));
      let datetime1 = new Date();
      datetime1.setDate(datetime1.getDate());
      console.log("date heroku", datetime1.toISOString());
      let utc1 = datetime1.getTime() + datetime1.getTimezoneOffset() * 60000;
      let nd1 = new Date(utc1 + 3600000 * +5.5);
      let todayDate1 = nd1.toISOString().slice(0, 10);
      for (i = 0; i < obj.length; i++) {
        var diff,
          nameValue,
          last_seen,
          count = 0;
        sortData.map((dataValue) => {
          let file = dataValue;
          nameValue = obj[i].dealer_name;
          let installation = obj[i].last_seen;
          diff = Math.floor(
            (Date.parse(datetime1) - Date.parse(installation)) / 86400000
          );
          if (file) {
            if (
              file.split("-")[0].toLowerCase().trim() ===
              nameValue.toLowerCase().trim()
            ) {
              var dateValue = file.split(".csv");
              var trimDate = dateValue[0].slice(-10);
              last_seen = trimDate;
              obj[i].last_seen = last_seen;
              count++;
            }
          }
        });
        obj[i].total_dropbox_file_miss_count = diff;
        let userData = {
          dealer_name: nameValue,
          miss_count: diff,
          last_seen: last_seen,
        };
        countData.push(userData);
        fs.writeFileSync("table/user_info.json", JSON.stringify(obj, null, 2));
      }
      console.log(data.length);
      let mailNotSent = [];
      let filterData = [];
      let count_missed = 0;
      let datetime = new Date();
      datetime.setDate(datetime.getDate() - 1);
      console.log("date heroku", datetime.toISOString());
      let utc = datetime.getTime() + datetime.getTimezoneOffset() * 60000;
      let nd = new Date(utc + 3600000 * +5.5);
      let todayDate = nd.toISOString().slice(0, 10);
      for (i = 0; i < obj.length; i++) {
        let flag = true;
        data.map((dataValue) => {
          let file = dataValue.name.split("_");
          let nameValue = obj[i].dealer_name + "-" + todayDate;
          if (
            file[0] === "Status" &&
            file[1].split(".csv")[0].toLowerCase().trim() ===
              nameValue.toLowerCase().trim()
          ) {
            flag = false;
            console.log(
              "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&"
            );
            console.log(obj[i]);
            console.log(
              "&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&"
            );
            mailNotSent.push(obj[i]);
            obj[i].dropbox_file_miss_count = 0;
          }
        });

        if (flag) {
          let count = obj[i].dropbox_file_miss_count + 1;
          obj[i].dropbox_file_miss_count = count;
          filterData.push(obj[i]);
        }
      }
      let columns = {
        business_division: "business_division",
        dealer_name: "dealer_name",
        dealer_code: "dealer_code",
        dealer_email: "dealer_email",
        dealer_name: "dealer_name",
        dealer_contact: "dealer_contact",
        salesperson_email: "salesperson_email",
        salesperson_name: "salesperson_name",
        salesperson_contact: "salesperson_contact",
        installation_date: "installation_date",
        total_dropbox_file_miss_count: "total_dropbox_file_miss_count",
        dropbox_file_miss_count: "dropbox_file_miss_count",
        last_seen: "last_seen",
      };
      stringify(
        mailNotSent,
        { header: true, columns: columns },
        (err, output) => {
          if (err) throw err;
          fs.writeFile("./files/" + todayDate + ".csv", output, (err) => {
            if (err) throw err;
            console.log("File saved.");
          });
        }
      );
      fs.writeFileSync("table/user_info.json", JSON.stringify(obj, null, 2));
      var obj2 = JSON.parse(fs.readFileSync("table/user_info.json", "utf8"));
      let mailNotSentId = "";
      // let result = await mailToDealer.sendMailToDealer(filterData);
      // console.log(result);
      // let result2 = await consolidatedMail.consolidatedMail(
      //   filterData,
      //   mailNotSent
      // );
      let result3 = await salespersonMail.salespersonMail(filterData);
      // console.log(mailNotSent);
      // let result4 = await dailyData.dailyData(mailNotSent);
      // console.log(result2);
      // console.log("{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
      // console.log(result3);
      // console.log(result4);
      // console.log("{{{{{{{{{{{{{{{{{{{{{}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}");
    });
});
