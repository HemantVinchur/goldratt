var express = require('express');
var router = express.Router();
let pool = require('../../db')
const fetch = require("node-fetch");
const fs = require("fs");
const csv = require('csvtojson');

router.get('/getUsers', (req, res) => {
    getData();
    // var link = "table/user_info.csv";
    async function getData() {
        fs.readFile(('table/user_info.csv'), 'utf8', (err, data) => {
            console.log(err);

            console.log(data);

        })
        const converter = csv()
            .fromFile('table/user_info.csv')
            .then((json) => {
                console.log(json);
            })
        fs.writeFile("./routes/Admin_Data/dealers/config.json", JSON.stringify(config, null, 2), (err) => {
            if (err) {
                console.log(err)
                return res.status(500).json({ success: false, msg: "Some error occured" });
            } else {
                return res.json({ success: true, msg: "File count updated" })
            }
        });
        // const data = await response.text();
        // console.log(data);

    }
    // let query = `select * from user_info;select count(id) as total from user_info where dealer_type="Dealer";select count(id) as total from user_info where dealer_type="Retailer";select count(id) as total from user_info where dealer_type="Vendor"`
    // pool.query(query)
    //     .then((result) => {
    //         if (result[0].length > 0) {
    //             res.json({ success: true, users: result[0], no_of_dealers: result[1][0].total, no_of_retailer: result[2][0].total, no_of_vendor: result[3][0].total });
    //         } else { 
    //             res.json({ success: false, msg: "No user found" });
    //         }
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //         res.json({ success: false, msg: "Some error occured" });
    //     })
})

module.exports = router;