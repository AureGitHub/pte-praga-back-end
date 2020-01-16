// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'gmail',
//     secure: false,
//     port: 25,
//     auth: {
//       user: 'auredeveloper@gmail.com',
//       pass: 'jas11jas11'
//     },
//     tls: {
//       rejectUnauthorized: false
//     }
//   });

///typeContent: 'text/plain'
const SendEmail = function (email_to,subject, typeContent, contenido ){
var helper = require('sendgrid').mail;
var from_email = new helper.Email('sunday.praga.sunday@aurenet.com');
var to_email = new helper.Email(email_to);
var subject = 'Hello World from the SendGrid Node.js Library!';
var content = new helper.Content(typeContent, contenido);
var mail = new helper.Mail(from_email, subject, to_email, content);

require('dotenv').config();

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
var request = sg.emptyRequest({
  method: 'POST',
  path: '/v3/mail/send',
  body: mail.toJSON(),
});

sg.API(request, function(error, response) {
  // console.log(response.statusCode);
  // console.log(response.body);
  // console.log(response.headers);
});
  

}

  module.exports = SendEmail;