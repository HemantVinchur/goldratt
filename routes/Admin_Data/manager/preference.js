var express = require('express');
var router = express.Router();
let pool = require('../../db')

router.post("/:id",(req,res)=>{
    let {id}=req.params;
    let {fileMissCount,emailCount}=req.body;
    if(!id)
        return res.status(400).json({success:false,msg:"id not provided"});
    if(!fileMissCount && !emailCount)
        return res.status(400).json({success:false,msg:"count not provided"});
    let query=`update manager set file_miss_count_mail_preference='${fileMissCount}',daily_mail_day_pref='${emailCount}' where id='${id}'`;
    pool.query(query)
    .then((result)=>{
        if(result.affectedRows>0)
        {   
            return res.json({success:true,msg:"Preference Set"});
        }
        return res.status(500).json({success:false,msg:"Some error occured"});
    }) 
    .catch((error)=>{
        res.send(error);
    })
})

router.post("/email/:id",(req,res)=>{
    let {id}=req.params;
    let {count}=req.body;
    if(!id)
        return res.status(400).json({success:false,msg:"id not provided"});
    if(!count)
        return res.status(400).json({success:false,msg:"count not provided"});
    let query=`update manager set daily_mail_day_pref='${count}' where id='${id}'`;
    pool.query(query)
    .then((result)=>{
        if(result.affectedRows>0)
        {
            return res.json({success:true,msg:"Preference Set"});
        }
        return res.status(500).json({success:false,msg:"Some error occured"});
    }) 
    .catch((error)=>{
        res.send(error);
    })
})

module.exports= router;