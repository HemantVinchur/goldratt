let Client = require('ssh2-sftp-client');
let sftp = new Client();
const scheduler = require('node-schedule');
const pool=require("./routes/db");
const nodemailer = require("nodemailer");

let rule = new scheduler.RecurrenceRule();
rule.tz="Asia/Kolkata"
rule.hour = 17;
rule.minute=18;
rule.second=00;
rule.dayOfWeek = new scheduler.Range(0,6);
console.log(new Date());
let transporter = nodemailer.createTransport({
    service: "gmail",// true for 465, false for other ports
      port: 465,
      secure: true,
    auth: {
      user: 'tallyconnectoredu@gmail.com', // generated ethereal user
      pass: 'Tally@123' // generated ethereal password
    }
  })
  ///^((?!2020-06-23).)*$/
console.log("file called")
const dailyJob = scheduler.scheduleJob(rule,()=>{
    sftp.connect({
        host: '123.108.50.210',
        port: '9222',
        username: 'goldrattuser',
        password: 'symph0ny@g0Ld'
      }).then(() => {
        let datetime = new Date();
        console.log("date heroku",datetime.toISOString())
        let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
        let nd = new Date(utc + (3600000*+5.5));
        let todayDate=nd.toISOString().slice(0,10);
        return sftp.list('/home/goldrattuser/Archive',`*${todayDate}*`);
      }).then(data => {
        console.log(data, 'the data info');
        console.log(data.length);
        let mailNotSent=[];
        let sqlQuery=`select id,dealer_name,dealer_email,salesperson_email,salesperson_contact,dealer_code,dropbox_file_miss_count from user_info`
        pool.query(sqlQuery)
        .then((userList)=>{
             let datetime = new Date();
             console.log("date heroku",datetime.toISOString())
             let utc = datetime.getTime() + (datetime.getTimezoneOffset() * 60000);
             let nd = new Date(utc + (3600000*+5.5));
             let todayDate=nd.toISOString().slice(0,10);
            //  let datetime = new Date();
            //  datetime.setDate(datetime.getDate()-1)
            //  let todayDate=datetime.toISOString().slice(0,10);
             const filterData=userList.filter((value)=>{
                let flag=true;
                data.map((dataValue)=>{
                    let file=dataValue.name.split("_");
                    let nameValue=value.dealer_name+"-"+todayDate;
                    if(file[0]==="Status" && file[1].split('.csv')[0].toLowerCase().trim()===nameValue.toLowerCase().trim())
                    {
                        
                        flag=false;
                        mailNotSent.push(value);
                    }
                })
                if(flag)
                {
                    return true;
                }
             })
             console.log(filterData);
             console.log("mail not sent",mailNotSent);
             let emails=[];
             let mailNotSentId='';
             let mailSentStatusQuery='';
             filterData.forEach(element => {
               let count=element.dropbox_file_miss_count+1;
                mailSentStatusQuery+=`update user_info set dropbox_file_miss_count='${count}' where id=${element.id};`
                 emails.push({
                    to:element.dealer_email,
                    from:'Connector_DoNotReply< connector.support@prismjohnson.in>',
                    subject:`Distributor Name – ${element.dealer_code}  ${element.dealer_name} – Disruption in connector data flow as on ${todayDate.split('-')[2]}/${todayDate.split('-')[1]}/${todayDate.split('-')[0]}`,
                    html:`<p>Dear User,</p>
                    <br/>
                    <p>It has been noted that the data from connector is not flowing since <b>${todayDate.split('-')[2]}/${todayDate.split('-')[1]}/${todayDate.split('-')[0]}</b>. Please note the following possible reasons and correct them accordingly.</p>
                    <br/>
                    <p><ol><li>Computer and / or internet is not on while transmitting the data. Resolution: Ensure that the computer and internet is on at the scheduled time of transmitting data</li><li>Latest stock file is not available at the target folder. Resolution: Ensure that daily stock file in the prescribed format with latest data is kept at the target folder <b>\\desktop\\connector</b></li></ol></p>
                    <p>If above things are in place please contact ${element.salesperson_contact} for resolving this issue</p>
                    <p>Have a pleasant Day!<br>HRJ’s Symphony Connector<br>Please do not reply - this Email was generated automatically by Symphony</p>`
                 })
             });
             mailNotSent.forEach((item)=>{
                mailNotSentId+=item.id+',';
             })
             mailNotSentId=mailNotSentId.slice(0,mailNotSentId.length-1);
             console.log(emails);
             emails.forEach((email)=>{
                transporter.sendMail(email,(err,info)=>{
                    if(err)
                    {
                        console.log(err)
                        console.log(`Email not sent to ${email.to}`);
                    }
                    console.log(info)
                })
             })
            
            let updateStatusQuery=`update user_info set dropbox_file_miss_count=0 where id in (${mailNotSentId});`+mailSentStatusQuery;
            pool.query(updateStatusQuery)
            .then((result)=>{
              console.log("status updated",result);
            })
            .catch((error)=>{
              console.log("status not updated error",error);
          })

        })
        .catch((error)=>{
            console.log("error",error);
        })
      }).catch(err => {
        console.log(err, 'catch error');
      });
})
