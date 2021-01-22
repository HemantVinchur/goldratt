var express = require('express');
var router = express.Router();
let pool = require('../../db')

router.post("/",(req,res)=>{
    let {name,email,contact}=req.body;
    if(!name || !email || !contact)
        return res.json({success:false,msg:"name or email or contact is missing"});
    let user={name,email,contact};
    let addQuery=`insert into manager(name,email,contact) values('${name}','${email}','${contact}')`
    pool.query(addQuery)
    .then((result)=>{
        if(result.affectedRows>0)
        {
            return res.json({success:true,msg:"Manager Added"});
        }
        return res.status(500).json({success:false,msg:"Some error occured"});
    })
    .catch((error)=>{
        if(error.code=="ER_DUP_ENTRY")
            return res.status(400).json({success:false,msg:"Manager Already Present with this email"})
        res.status(400).send(error);
    })
})

module.exports=router;