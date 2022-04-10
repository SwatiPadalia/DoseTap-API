const nodemailer = require('nodemailer');
const sesTransport = require('nodemailer-ses-transport');

const mailSender = {

    sendMail: function (param) {

        let result = true;

        var sesTransporter = nodemailer.createTransport(sesTransport({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        }));

        var mailOptions = {
            from: process.env.FROM_EMAIL,
            to: param.toEmail,
            subject: param.subject,
            html: param.emailBody
        };

        sesTransporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log("🚀 ~ file: sendEmail.js ~ line 33 ~ error", error)
                result = false;
            }
        });

        return result;
    }
};

module.exports = mailSender;