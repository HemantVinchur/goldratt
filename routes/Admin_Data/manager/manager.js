var express = require('express');
var router = express.Router();

router.use("/add",require('./add'));

router.use("/preference",require('./preference'));

router.use("/getAll",require('./getAll'));

router.use("/mapSalesperson",require('./mapSalesperson'));
module.exports=router;