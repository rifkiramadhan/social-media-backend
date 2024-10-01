const nodemailer = require('nodemailer');

const sendPasswordEmail = async (to, resetToken) => {
  try {
    //! 1. Create Transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    //! Create the message
    const message = {
      to,
      subject: 'Password Reset',
      html: `<p>You are receiving this email because you (or someone else) have requested to verify your account.</p>
      <p>Please click on the follow ling, or posts this into your browser to complete the process:</p>
      <p>${process.env.URL_CLIENT_PROD}/reset-password/${resetToken}</p>
      <p>If you did not request this, please ignore this email and your password will remain uncharged.</p>`,
    };
    //! Send the mail
    const info = await transporter.sendMail(message);
    console.log('Email sent: ', info.messageId);

    return info;
  } catch (error) {
    console.log(error);
    throw new Error('Email sending failed!');
  }
};

module.exports = sendPasswordEmail;
