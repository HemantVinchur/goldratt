var express = require('express');
var router = express.Router();
let pool = require('../../db')


router.put('/',(req,res)=>{

    let {name,email,contact,id}=req.body;
    if(name && email && contact && id)
    {
       let query=`update salesperson set name='${name}',email='${email}',contact='${contact}' where id='${id}'`
      pool.query(query)
      .then((result)=>{
          if(result.affectedRows>0)
          {
            res.json({success:true,msg:"Profile Updated"})
          }
          else{
            res.json({success:false,msg:"Sales Person Not Found with this email"})
          }
          
      })
      .catch((error)=>{
        console.log(error);
        res.json({success:false,msg:"Some error occured"});
      })
    }
    else{
        res.status(500).render({success:false,msg:"Some values are missing"});
    }
  });

  module.exports=router;