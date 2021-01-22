var express = require('express');
var router = express.Router();

router.use("/",require("./dealers/dealers"))

router.use("/manager",require('./manager/manager'));

router.use("/salesperson",require('./salesperson/salesperson'));

module.exports=router;
