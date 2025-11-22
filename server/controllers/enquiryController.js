const nodemailer = require("nodemailer");
const Appointment = require("../models/appointment");

const sendEnquiryEmail = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      petId,
      petName,
      appointmentId,
      providerEmail,
      providerName,
      providerType,
    } = req.body;

    const toEmail =
      providerEmail ||
      req.body.shopEmail ||
      req.body.ngoEmail ||
      process.env.EMAIL_USER;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let appointment = null;
    let appointmentInfoHTML = "";
    let appointmentInfoText = "";

    let serviceTypeLabel =
      providerType === "ngo" ? "Pet Adoption" : "Shop Appointment";

    if (appointmentId) {
      appointment = await Appointment.findById(appointmentId).populate(
        "providerId",
        "name"
      );

      if (appointment) {
        const formattedDate = new Date(appointment.date).toLocaleDateString();

        serviceTypeLabel =
          appointment.service === "pet_adoption"
            ? "Pet Adoption"
            : "Shop Appointment";

        appointmentInfoHTML = `
          <div>
            <strong>Date:</strong> ${formattedDate}<br/>
            <strong>Time:</strong> ${appointment.time}<br/>
            <strong>Service:</strong> ${serviceTypeLabel}
          </div>
        `;

        appointmentInfoText = `
Date: ${formattedDate}
Time: ${appointment.time}
Service: ${serviceTypeLabel}
`;
      }
    }

    const subject =
      serviceTypeLabel === "Pet Adoption"
        ? `New Pet Adoption Enquiry - ${petName}`
        : `New Shop Appointment Enquiry - ${petName}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      replyTo: email,
      subject,
      text: `
${serviceTypeLabel} Enquiry

Pet: ${petName}
Pet ID: ${petId}

Customer: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

${appointmentInfoText}
      `,
      html: `
      <html>
      <body>
        <h2>${serviceTypeLabel} Enquiry</h2>

        <h3>Provider</h3>
        <p>${providerName}<br/>${providerEmail}</p>

        <h3>Pet Details</h3>
        <p>${petName} (ID: ${petId})</p>

        <h3>Customer</h3>
        <p>${name}<br/>${email}<br/>${phone}</p>

        ${appointmentInfoHTML}

        <h3>Message</h3>
        <p>${message}</p>

        <hr/>
        <p>Received at ${new Date().toLocaleString()}</p>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Enquiry sent successfully!" });
  } catch (error) {
    console.error("Error sending enquiry email:", error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
};

module.exports = sendEnquiryEmail;
