const nodemailer = require('nodemailer')

// console.log(process.env.EMAIL_HOST,process.env.EMAIL_PORT,process.env.MAIL_USER, process.env.MAIL_PASS)

const sendEmail = async options =>  {
    // 1) Create a transporter (Transporter is a serive that will actually send the email)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    })

    // 2) Define the email options
    const mailOptions = {
        from: 'Mert Ali BARIN <devmelrati@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions, (err,info) => {
        if(err) {
            console.log(err);
        }
        else {
            console.log(info);
        }
    });
};

module.exports = sendEmail;