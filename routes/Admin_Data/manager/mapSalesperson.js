var express = require('express');
var router = express.Router();
let pool = require('../../db')

router.post("/",(req,res)=>{
    let {managerId,salesPersonIds} = req.body;
    if(managerId && salesPersonIds)
    {
        if(salesPersonIds.length>0)
        {
            let insertValues=[];
            salesPersonIds.forEach((id)=>{
                insertValues.push([managerId,id])
            })
            let mapQuery= `insert into manager_salesperson_map(manager_id,salesperson_id) VALUES ?`
            pool.query(mapQuery,[insertValues])
            .then((result)=>{
                if(result.affectedRows>0)
                {
                    res.json({success:true,msg:"Salespersons mapped successfully"});
                }
                else{
                    return res.status(500).json({success:false,msg:"Some error occured"});
                }
            })
            .catch((error)=>{
                console.log(error); 
                return res.status(500).json({success:false,msg:"Some error occured"});
            })
        }
        else{
            res.status(400).render({success:false,msg:"Sales Person IDS not provided"});
        }
    }
    else{
        res.status(400).render({success:false,msg:"Some values are missing"});
    }
})
module.exports= router;