var express = require('express');
var router = express.Router();
const pool = require("../../db");
let Client = require('ssh2-sftp-client');
let sftp = new Client();
const fs = require('fs');
require('dotenv').config();

router.get("/count", (req, res) => {
    console.log("file called")
    sftp.connect({ host: '123.108.50.210', port: '9222', username: 'goldrattuser', password: 'symph0ny@g0Ld' }).then(() => {
        let datetime = new Date();
        console.log("date heroku", datetime.toISOString())
        let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
        let nd = new Date(utc + (3600000 * +5.5));
        let todayDate = nd.toISOString().slice(0, 10);
        let sqlQuery = `select * from user_info`

        return sftp.list('/home/goldrattuser/Archive/');
    }).then(data => {
        let mailNotSent = [];
        let sqlQuery = `select id,dealer_name,dealer_email,dealer_contact,salesperson_name,salesperson_email,salesperson_contact,dealer_code,dropbox_file_miss_count from user_info`
        pool.query(sqlQuery).then(async(userList) => {
            let datetime = new Date();
            console.log("date heroku", datetime.toISOString())
            let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
            let nd = new Date(utc + (3600000 * +5.5));
            let todayDate = nd.toISOString().slice(0, 10);
            // let datetime = new Date();
            // datetime.setDate(datetime.getDate()-1)
            // let todayDate=datetime.toISOString().slice(0,10);
            const filterData = userList.filter((value) => {
                let flag = true;
                data.map((dataValue) => {
                    let file = dataValue.name.split("_");
                    let nameValue = value.dealer_name + "-" + todayDate;
                    if (file[0] === "Status" && file[1].split('.csv')[0].toLowerCase().trim() === nameValue.toLowerCase().trim()) {

                        flag = false;
                        mailNotSent.push(value);
                    }
                })
                if (flag) {
                    return true;
                }
            })
            let mailNotSentId = '';


            let result = await mailToDealer.sendMailToDealer(filterData);
            console.log(result);
            mailNotSent.forEach((item) => {
                mailNotSentId += item.id + ',';
            })
            mailNotSentId = mailNotSentId.slice(0, mailNotSentId.length - 1);

            let result2 = await consolidatedMail.consolidatedMail(filterData);
            console.log(result2);
            let updateStatusQuery;
            if (mailNotSentId.length < 1) {
                updateStatusQuery = result.mailSentStatusQuery + result2.updateManagerMailPref;
            } else {
                updateStatusQuery = `update user_info set dropbox_file_miss_count=0 where id in (${mailNotSentId});` + result.mailSentStatusQuery + result2.updateManagerMailPref;
            }

            pool.query(updateStatusQuery).then((result) => {
                console.log("status updated", result);
            }).catch((error) => {
                console.log("status not updated error", error);
            })

        }).catch((error) => {
            console.log("error", error);
        })
    }).catch(err => {
        console.log(err, 'catch error');
    });
})

router.get("/counts", (req, res) => {
    let connection = 0;
    let connectData;
    if (connection == 0) {
        connectData = sftp.connect({ host: '123.108.50.210', port: '9222', username: 'goldrattuser', password: 'symph0ny@g0Ld' }).then(() => {
            connection = 1;
            return sftp.list('/home/goldrattuser/Archive/');
        }).then(data => {
            // let mailNotSent = [];
            let sliceData = [];
            let countData = [];
            for (i = 0; i < data.length; i++) {
                let dealerName = data[i].name.split("_")[1];
                sliceData.push(dealerName);
            }

            let sortData = sliceData.sort();
            var obj = JSON.parse(fs.readFileSync('table/user_info.json', 'utf8'));
            let datetime = new Date();
            datetime.setDate(datetime.getDate());
            console.log("date heroku", datetime.toISOString())
            let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
            let nd = new Date(utc + (3600000 * +5.5));
            let todayDate = nd.toISOString().slice(0, 10);
            for (i = 0; i < obj.length; i++) {
                var diff, nameValue, last_seen, count = 0;
                sortData.map((dataValue) => {
                    let file = dataValue;
                    nameValue = obj[i].dealer_name;
                    let installation = obj[i].last_seen;
                    diff = Math.floor((Date.parse(datetime) - Date.parse(installation)) / 86400000);
                    if (file) {
                        if (file.split('-')[0].toLowerCase().trim() === nameValue.toLowerCase().trim()) {
                            var dateValue = file.split(".csv");
                            var trimDate = dateValue[0].slice(-10);
                            last_seen = trimDate;
                            obj[i].last_seen = last_seen;
                            count++;
                        }
                    }
                })
                console.log(diff);
                console.log(count);
                console.log("???????????????????????????????????????????????????????????????????");
                // let miss_count = diff - count;
                obj[i].total_dropbox_file_miss_count = diff;
                fs.writeFileSync('table/user_info.json', JSON.stringify(obj, null, 2));
                let userData = { dealer_name: nameValue, miss_count: diff, last_seen: last_seen };
                countData.push(userData);
            }
            if (countData.length >= 1) {
                return res.status(200).json({
                    success: 'true',
                    message: 'Data found',
                    data: countData
                })
            } else {
                return res.status(200).json({
                    success: 'true',
                    message: 'Data not found',
                    data: []
                })
            }
        }).catch(err => {
            console.log(err, 'catch error');
        });
    } else {
        connectData.then(() => {
            return sftp.list('/home/goldrattuser/Archive/');
        }).then(data => {
            let countData = [];
            for (i = 0; i < data.length; i++) {
                let dealerName = data[i].name.split("_")[1];
                sliceData.push(dealerName);
            }
            let sortData = sliceData.sort();
            var obj = JSON.parse(fs.readFileSync('table/user_info.json', 'utf8'));
            let datetime = new Date();
            datetime.setDate(datetime.getDate());
            console.log("date heroku", datetime.toISOString())
            let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
            let nd = new Date(utc + (3600000 * +5.5));
            let todayDate = nd.toISOString().slice(0, 10);
            for (i = 0; i < obj.length; i++) {
                var diff, nameValue, last_seen, count = 0;
                sortData.map((dataValue) => {
                    let file = dataValue;
                    nameValue = obj[i].dealer_name;
                    let installation = obj[i].last_seen;
                    diff = Math.floor((Date.parse(datetime) - Date.parse(installation)) / 86400000);

                    if (file) {
                        if (file.split('-')[0].toLowerCase().trim() === nameValue.toLowerCase().trim()) {
                            var dateValue = file.split(".csv");
                            var trimDate = dateValue[0].slice(-10);
                            last_seen = trimDate;
                            obj[i].last_seen = last_seen;
                            count++;
                        }
                    }
                })
                console.log(diff);
                console.log(count);
                console.log("???????????????????????????????????????????????????????????????????");

                // let miss_count = diff - count;
                obj[i].total_dropbox_file_miss_count = diff;
                fs.writeFileSync('table/user_info.json', JSON.stringify(obj, null, 2));
                let userData = { dealer_name: nameValue, miss_count: diff, last_seen: last_seen };
                countData.push(userData);
            }
            if (countData.length >= 1) {
                return res.status(200).json({
                    success: 'true',
                    message: 'Data found',
                    data: countData
                })
            } else {
                return res.status(200).json({
                    success: 'true',
                    message: 'Data not found',
                    data: []
                })
            }
        }).catch(err => {
            console.log(err, 'catch error');
        });
    }
})
module.exports = router;