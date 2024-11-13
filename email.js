const sgMail = require("@sendgrid/mail");

sgMail.setApiKey("use real api key"); // api key

let code = "123456"; // test code
const msg = {
  to: "xxx@gmail.com", // receiver email
  from: "sjsucs166@gmail.com", // sender email, verified email on sendgird
  subject: "Testing SendGrid API",
  text: `This is a test email sent using SendGrid.`,
  html: `<strong>This is a test email sent using SendGrid.</strong><br><p>Your verification code is: <strong>${code}</strong></p>`,
  headers: {
    "List-Unsubscribe": "<mailto:your-unsubscribe-email@example.com>",
  },
};

sgMail
  .send(msg)
  .then(() => {
    console.log("Test email sent successfully");
  })
  .catch((error) => {
    console.error(
      "Error sending email:",
      error.response ? error.response.body : error
    );
  });
