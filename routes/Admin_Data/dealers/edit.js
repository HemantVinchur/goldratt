var express = require('express');
var router = express.Router();
let pool = require('../../db')


router.put('/',(req,res)=>{

    let {dealer_name,dealer_email,dealer_contact,salesperson_name,salesperson_email,salesperson_contact,dealer_code,new_dealer_email}=req.body;
    if(dealer_name && dealer_email && dealer_contact && salesperson_name && salesperson_email && salesperson_contact && dealer_code)
    {
      let query;
      if(new_dealer_email.trim().length>4)
      {
        query=`update user_info set dealer_name='${dealer_name}',dealer_email='${new_dealer_email}',dealer_contact='${dealer_contact}',salesperson_name='${salesperson_name}',salesperson_email='${salesperson_email}',salesperson_contact='${salesperson_contact}',dealer_code='${dealer_code}' where dealer_email='${dealer_email}'`
      }
      else{
        query=`update user_info set dealer_name='${dealer_name}',dealer_contact='${dealer_contact}',salesperson_name='${salesperson_name}',salesperson_email='${salesperson_email}',salesperson_contact='${salesperson_contact}',dealer_code='${dealer_code}' where dealer_email='${dealer_email}'`
      }
      pool.query(query)
      .then((result)=>{
          if(result.affectedRows>0)
          {
            res.json({success:true,msg:"Profile Updated"})
          }
          else{
            res.json({success:false,msg:"Dealer Not Found with this email"})
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