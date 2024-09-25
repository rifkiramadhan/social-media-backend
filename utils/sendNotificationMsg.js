const nodemailer = require('nodemailer');

const sendNotificationMsg = async (to, postId) => {
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
      subject: 'New Post Created',
      html: `<p>A new post has been created on our site Social Media</p>
      <p>Click <a href="http://localhost:5173/posts/${postId}">here</a> to view the post.</p>`,
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

module.exports = sendNotificationMsg;
