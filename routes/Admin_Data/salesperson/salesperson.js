var express = require('express');
var router = express.Router();

router.use("/add",require("./add"));

router.use("/getAll",require("./getAll"));

router.use("/getSuspended",require("./getSuspended"));

router.use("/edit",require("./edit"));

router.use("/autocomplete",require("./salespersonAutocomplete"));

router.use("/suspend",require("./suspend"));

module.exports=router;
