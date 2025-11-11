const nodemailer = require("nodemailer");

const sendEnquiryEmail = async (req, res) => {
  try {
    const { name, email, phone, message, petId, petName } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `Pet Enquiry - ${petName}`,
      text: `
New Pet Enquiry

Pet Details:
Pet Name: ${petName}
Pet ID: ${petId}

Contact Information:
Name: ${name}
Email: ${email}
Phone: ${phone}

Customer Message:
${message}

Enquiry received: ${new Date().toLocaleString()}

Please respond to the customer within 24 hours.

Best regards,
PetShop Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
    .section-title { font-weight: bold; margin-bottom: 10px; color: #2d3748; }
    .field { margin-bottom: 8px; }
    .label { font-weight: bold; color: #4a5568; }
    .footer { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>New Pet Enquiry</h2>
    
    <div class="section">
      <div class="section-title">Pet Details</div>
      <div class="field">
        <span class="label">Pet Name:</span> ${petName}
      </div>
      <div class="field">
        <span class="label">Pet ID:</span> ${petId}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Contact Information</div>
      <div class="field">
        <span class="label">Name:</span> ${name}
      </div>
      <div class="field">
        <span class="label">Email:</span> ${email}
      </div>
      <div class="field">
        <span class="label">Phone:</span> ${phone}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Customer Message</div>
      <div>${message.replace(/\n/g, "<br>")}</div>
    </div>

    <div class="footer">
      <div>Enquiry received: ${new Date().toLocaleString()}</div>
      <div><strong>Please respond to the customer within 24 hours.</strong></div>
      <div>Best regards,<br>PetShop Team</div>
    </div>
  </div>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Enquiry sent successfully!",
    });
    console.log(
      "Enquiry of Buying Product Sent By ",
      mailOptions.from,
      mailOptions.subject
    );
  } catch (error) {
    console.error("Error sending enquiry email:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send enquiry.",
    });
  }
};

module.exports = sendEnquiryEmail;
