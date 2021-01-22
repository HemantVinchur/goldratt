var express = require('express');
var router = express.Router();
let pool = require('../../db')
const nodemailer = require("nodemailer");
require('dotenv').config()


let transporter = nodemailer.createTransport({
    service: "gmail",// true for 465, false for other ports
      port: 465,
      secure: true,
    auth: {
      user: process.env.EMAIL, // generated ethereal user
      pass: process.env.PASSWORD // generated ethereal password
    }
  })


router.post('/signup',(req,res)=>{
    let {dealer_name,dealer_email,dealer_contact,salesperson_name,salesperson_email,salesperson_contact,dealer_code,connector_type,dealer_type,salesperson_id}=req.body;
    if(dealer_name && dealer_email && dealer_contact && salesperson_name && salesperson_email && salesperson_contact && dealer_code && connector_type && dealer_type)
    {
      let randomHelper=(Math.random() * (0.8 - 0.1) + 0.1)*1000000;
      let license_number=Math.floor(randomHelper);
      let query=`INSERT into user_info(dealer_name,dealer_email,dealer_contact,salesperson_name,salesperson_email,salesperson_contact,license_number,dealer_code,connector_type,dealer_type) values('${dealer_name}','${dealer_email}','${dealer_contact}','${salesperson_name}','${salesperson_email}','${salesperson_contact}','${license_number}','${dealer_code}','${connector_type}','${dealer_type}')`
      pool.query(query)
      .then(async(result)=>{
          if(result.affectedRows>0)
          {
            let mailOptions={
              from: '"Tally Connector/DropBox" <no-reply3@hrjohnsonindia.com>', // sender address
              to: dealer_email, // list of receivers
              subject: 'Your ID and License No(Tally Connector/DropBox)', // Subject line
              html: `
              <p>Welcome to Tally Connector/DropBox. You are now a member of the world's fastest growing Business hub.
              Here's your ID and License No.</p>
              <br/>
              <p>ID: ${result.insertId}</p>
              <br/>
              License No:${license_number}
              <br/>
              <br/>
              Thank You
              `          }
            transporter.sendMail(mailOptions,(err,info)=>{
                if(err)
                {
                  console.log(err)
                 return res.status(500).json({success:false,msg:"Some error occured"});
                }
                else{
                  console.log(info);
                  res.json({success:true,msg:"User added successfully"});
                }
            })
          }
          else{
            return res.status(500).json({success:false,msg:"Some error occured"});
          }
      })
      .catch((error)=>{
          console.log(error);
          if(error.code=="ER_DUP_ENTRY")
          {
            return res.status(500).json({success:false,msg:"User already registered"});
          }
          else{
          return res.status(500).json({success:false,msg:"Some error occured"});
          }
      })
    }
    else{
      res.status(500).render({success:false,msg:"Some values are missing"});
    }
  })
  module.exports=router;