require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"TechMates" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};


async function sendRegistrationEmail(userEmail, name, role = 'client') {
  const normalizedRole = role === 'developer' ? 'developer' : 'client';
    const subject = `Welcome to TechMates, ${name}!`;

    const roleLine = normalizedRole === 'client'
      ? 'Your client account is active. You can now post requirements, discover verified developers, and hire with confidence.'
      : 'Your developer account is active. You can now build your profile, showcase your skills, and start getting client opportunities.';

    const text = `Hi ${name},\n\nWelcome to TechMates!\n\n${roleLine}\n\nWe are excited to have you with us.\n\nBest regards,\nTeam TechMates`;

    const html = `
      <p>Hi ${name},</p>
      <p>Welcome to <strong>TechMates</strong>!</p>
      <p>${roleLine}</p>
      <p>We are excited to have you with us.</p>
      <p>Best regards,<br/>Team TechMates</p>
    `;

    await sendEmail(userEmail, subject, text, html);
} 
module.exports = {
  sendEmail,
  sendRegistrationEmail
}