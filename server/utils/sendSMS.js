// const twilio = require('twilio');
// const client = new twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

// exports.sendSMS = async (to, message) => {
//   await client.messages.create({
//     body: message,
//     from: process.env.TWILIO_PHONE,
//     to
//   });
// };

exports.sendSMS = async (to, message) => {
  // For now, just log the OTP instead of sending SMS
  console.log(`(DEBUG) SMS OTP to ${to}: ${message}`);
}