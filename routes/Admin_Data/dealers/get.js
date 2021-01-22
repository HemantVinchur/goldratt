var express = require('express');
var router = express.Router();
let pool = require('../../db')

//Get User by id
router.get('/:id', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    if(req.params.id)
    {
      let query=`select id,license_number,dealer_name,dealer_code from user_info where id=${req.params.id}`
    pool.query(query)
    .then((result)=>{
      if(result.length>0)
      {
        console.log(result)
        res.status(202).json({success:true,id:result[0].id,License_no:result[0].license_number,Name:result[0].dealer_name,Dealer_code:result[0].dealer_code})
      }
      else{
        res.json({success:false,msg:"No user found with this id"});
      }
    })
    .catch((error)=>{
      console.log(error);
      res.json({success:false,msg:"Some error occured"});
    })
  }
  else{   
    res.json({success:false,msg:"id id missing"});
  }
  });

  //Get User via email
  router.get('/', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    let datetime = new Date();
    console.log("data heroku",datetime.toISOString())
    let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
    let nd = new Date(utc + (3600000*+5.5));
    //var ISTTime = new Date(datetime.getTime() + (ISTOffset + currentOffset)*60000);
    console.log(nd.toISOString());
    console.log(nd.toLocaleString());
    let email=req.query['email'];
    if(req.query.email)
    {
      let query=`select * from user_info where dealer_email='${email}'`
    pool.query(query)
    .then((result)=>{
      if(result.length>0)
      {
        console.log(result)
        res.status(202).json({success:true,result});
      }
      else{
        res.json({success:false,msg:"No user found with this email"});
      }
    })
    .catch((error)=>{
      console.log(error);
      res.json({success:false,msg:"Some error occured"});
    })
  }
  else{   
    res.json({success:false,msg:"email is missing"});
  }
  });

  module.exports=router;