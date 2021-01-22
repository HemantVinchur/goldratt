var express = require('express');
var router = express.Router();

router.use("/", require('./add'));

router.use("/", require('./getAll'));

router.use("/", require('./get'));

router.use("/", require('./edit'));

router.use("/get", require('./count'));

router.use("/configure", require('./configure'))
module.exports = router;