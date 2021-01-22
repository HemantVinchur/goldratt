var express = require('express');
var router = express.Router();


router.use("/Admin_Data",require('./Admin_Data'))

// Router.delete('Admin_Data/:id',(req,res)=>{

// })
module.exports = router;
