const nodemailer = require("nodemailer");
const fs = require("fs");
const pool = require("../routes/db");

let transporter = nodemailer.createTransport({
  service: "gmail", // true for 465, false for other ports
  port: 465,

  secure: true,
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.PASSWORD, // generated ethereal password
  },
});

const consolidatedMail = (filterData, mailNotSent) => {
  return new Promise((resolve, reject) => {
    let datetime = new Date();
    datetime.setDate(datetime.getDate() - 1);
    console.log("date heroku", datetime.toISOString());
    let utc = datetime.getTime() + datetime.getTimezoneOffset() * 60000;
    let nd = new Date(utc + 3600000 * +5.5);
    let todayDate = nd.toISOString().slice(0, 10);
    var managers = JSON.parse(fs.readFileSync("table/manager.json", "utf8"));
    managers.forEach((element, index) => {
      //  if (element.daily_mail_day_pref == element.current_mail_buffer) {
      let tableStr1 = "";
      let tableStr2 = "";
      filterData.forEach((dealer) => {
        //  if (dealer.dropbox_file_miss_count >= element.file_miss_count_mail_preference) {
        tableStr1 += `<tr>
                                <td style="border: 1px solid black;">${dealer.dealer_name}</td>
                                <td style="border: 1px solid black;">${dealer.dealer_code}</td>
                                <td style="border: 1px solid black;">${dealer.dealer_contact}</td>
                                <td style="border: 1px solid black;">${dealer.salesperson_name}</td>
                                <td style="border: 1px solid black;">${dealer.salesperson_contact}</td>
                                <td style="border: 1px solid black;">${dealer.total_dropbox_file_miss_count}</td>
                                <td style="border: 1px solid black;">${dealer.last_seen}</td>
                                <td style="border: 1px solid black;">${dealer.business_division}</td>
                            </tr>`;
        //  }
      });
      mailNotSent.forEach((dealer) => {
        tableStr2 += `<tr>
                                        <td style="border: 1px solid black;">${dealer.dealer_name}</td>
                                        <td style="border: 1px solid black;">${dealer.dealer_code}</td>
                                        <td style="border: 1px solid black;">${dealer.dealer_contact}</td>
                                        <td style="border: 1px solid black;">${dealer.salesperson_name}</td>
                                        <td style="border: 1px solid black;">${dealer.salesperson_contact}</td>
                                        <td style="border: 1px solid black;">${dealer.total_dropbox_file_miss_count}</td>
                                        <td style="border: 1px solid black;">${dealer.last_seen}</td>
                                        <td style="border: 1px solid black;">${dealer.business_division}</td>
                                    </tr>`;
      });
      let mailHtml = `<p>It has been noted that the data from the following dealer are not flowing.</p>
                         <br/>
												   
                           <table style="width:100%; border: 1px solid black;">
                             <tr border: 1px solid black>
                                 <th style="border: 1px solid black;">Dealer Name</th>
                                 <th style="border: 1px solid black;">Dealer Code</th>
                                 <th style="border: 1px solid black;">Dealer Contact Number</th>
                                 <th style="border: 1px solid black;">Sales Person Name</th>
                                 <th style="border: 1px solid black;">Sales Person Number</th>
                                 <th style="border: 1px solid black;">File Miss Count</th>
                                 <th style="border: 1px solid black;">Last Data Received Date</th>
                                 <th style="border: 1px solid black;">Business Division</th>
                             </tr>
                             ${tableStr1}${tableStr2}
								 
							  
																									
							  
												   
																			 
														 
																					  
																					  
																								
																							
																							  
																							
								  
										 
                         </table>                     
                         `;
      let emailBody = {
        to: [element.email],
        from: "Connector_DoNotReply< connector.support@prismjohnson.in>",
        subject: `HRJ's Symphony Connector data not flowing as on ${
          todayDate.split("-")[2]
        }/${todayDate.split("-")[1]}/${todayDate.split("-")[0]}`,
        html: mailHtml,
      };
      transporter.sendMail(emailBody, (err, info) => {
        if (err) {
          console.log(err);
          console.log(`Email not sent to ${emailBody.to}`);
        }

        console.log(info);
      });
      managers[index].current_mail_buffer = 0;
      //  } else {
      //     managers[index].current_mail_buffer += 1;
      // }
    });
    fs.writeFileSync("table/manager.json", JSON.stringify(managers, null, 2));
    resolve("Success");
  });
};
exports.consolidatedMail = consolidatedMail;
