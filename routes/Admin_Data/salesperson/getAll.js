var express = require('express');
var router = express.Router();
let pool = require('../../db')

router.get('/',(req,res)=>{
    let query=`select id,name,email,contact from salesperson where status=1`
    pool.query(query)
    .then((result)=>{
      if(result.length>0)
      {
        res.json({success:true,users:result});
      }
      else{
        res.json({success:false,msg:"No user found"});
      }
    })
    .catch((error)=>{
      console.log(error);
      res.json({success:false,msg:"Some error occured"});
    })
})

module.exports=router;