var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
      user: 'auredeveloper@gmail.com',
      pass: 'jas11jas11'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  module.exports = transporter;