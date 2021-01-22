var express = require('express');
var router = express.Router();
let pool = require('../../db')


router.put('/',(req,res)=>{

    let {name,email,contact,id}=req.body;
    if(id)
    {
       let query=`update salesperson set status=0 where id='${id}'`
      pool.query(query)
      .then((result)=>{
          if(result.affectedRows>0)
          {
            res.json({success:true,msg:"Salesperson Suspended"})
          }
          else{
            res.json({success:false,msg:"Sales Person Not Found with this id"})
          }
          
      })
      .catch((error)=>{
        console.log(error);
        res.json({success:false,msg:"Some error occured"});
      })
    }
    else{
        res.status(500).render({success:false,msg:"id is missing"});
    }
  });

  module.exports=router;