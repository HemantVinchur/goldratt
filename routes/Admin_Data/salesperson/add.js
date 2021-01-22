var express = require('express');
var router = express.Router();
let pool = require('../../db')

router.post('/',(req,res)=>{
    let {name,email,contact}=req.body;
    if(name && email && contact)
    {
        let query=`INSERT into salesperson(name,email,contact) values('${name}','${email}','${contact}')`
        pool.query(query)
        .then((result)=>{
            if(result.affectedRows>0)
            {
                res.json({success:true,msg:"User added successfully"});
            }
            else{
                return res.status(500).json({success:false,msg:"Some error occured"});
            }
        })
        .catch((error)=>{
            console.log(error);
            if(error.code=="ER_DUP_ENTRY")
            {
              return res.status(400).json({success:false,msg:"User already registered"});
            }
            else{
            return res.status(500).json({success:false,msg:"Some error occured"});
            }
        })
    }
    else{
        res.status(400).render({success:false,msg:"Some values are missing"});
    }
})
module.exports=router;