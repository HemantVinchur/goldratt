var express = require('express');
var router = express.Router();
let config = require("./config.json");
const fs=require('fs')

router.post("/filecount",(req,res)=>{
    let {filecount,tallyfilemisscount} =req.body;
    if(!filecount)
        return res.status(400).json({success:false,msg:"filecount is required"});
    config.file_miss_count=filecount;
    config.tally_miss_count=tallyfilemisscount;
    fs.writeFile("./routes/Admin_Data/dealers/config.json",JSON.stringify(config,null,2),(err)=>{
        if(err)
        {
            console.log(err)
            return res.status(500).json({success:false,msg:"Some error occured"});
        }
        else{
            return res.json({success:true,msg:"File count updated"})
        }
    });
    
})
module.exports=router;