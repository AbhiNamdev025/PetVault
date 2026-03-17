const nodemailer = require("nodemailer");
const Appointment = require("../../models/Appointment/appointment");

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
      userId, // Ensure this is sent from frontend
      shopEmail,
      ngoEmail,
    } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const toEmail =
      providerEmail || shopEmail || ngoEmail || process.env.EMAIL_USER;

    // 1. Create Appointment if not exists (New Enquiry)
    let appointment = null;
    if (!appointmentId && userId) {
      try {
        const type = providerType?.toLowerCase();
        let service = "others";
        if (type === "ngo") service = "pet_adoption";
        if (type === "shop") service = "shop";

        appointment = await Appointment.create({
          user: userId,
          providerId: req.body.providerId, // Ensure this is passed
          providerType: type,
          service: service,
          petName: petName || "General Enquiry",
          petType: "Other", // Default, specific type not always known in enquiry
          parentPhone: phone,
          date: new Date(),
          time: "Enquiry",
          reason: `Enquiry: ${message}`,
          status: "pending",
          userEmail: email,
          userName: name,
        });
      } catch (err) {
        console.error("Failed to create appointment for enquiry:", err);
        // Continue to send email even if appointment creation fails (or return error?)
        // User asked "it should get its appointment", so this is critical.
      }
    } else if (appointmentId) {
      appointment = await Appointment.findById(appointmentId).populate(
        "providerId",
        "name",
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let appointmentInfoHTML = "";
    let appointmentInfoText = "";
    let serviceTypeLabel =
      providerType === "ngo" ? "Pet Adoption" : "Shop Appointment";

    if (appointment) {
      const formattedDate = new Date(appointment.date).toLocaleDateString();
      if (appointment.service === "pet_adoption")
        serviceTypeLabel = "Pet Adoption";
      if (appointment.service === "shop") serviceTypeLabel = "Shop Enquiry";

      appointmentInfoHTML = `
          <div>
            <strong>Date:</strong> ${formattedDate}<br/>
            <strong>Time:</strong> ${appointment.time}<br/>
            <strong>Service:</strong> ${serviceTypeLabel}<br/>
            <strong>Status:</strong> ${appointment.status}
          </div>
        `;

      appointmentInfoText = `
Date: ${formattedDate}
Time: ${appointment.time}
Service: ${serviceTypeLabel}
Status: ${appointment.status}
`;
    }

    const subject =
      serviceTypeLabel === "Pet Adoption"
        ? `New Pet Adoption Enquiry - ${petName}`
        : `New Shop Enquiry - ${petName || "Store"}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      replyTo: email,
      subject,
      text: `
${serviceTypeLabel} Enquiry

Pet: ${petName}
Pet ID: ${petId || "N/A"}

Customer: ${name}
Email: ${email}
Phone: ${phone}

Message:
${message}

${appointmentInfoText}
      `,
      html: `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4f46e5;">${serviceTypeLabel} Enquiry</h2>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top:0;">Pet/Item Details</h3>
          <p><strong>Name:</strong> ${petName}<br/><strong>ID:</strong> ${
            petId || "N/A"
          }</p>
        </div>

        <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin-top:0;">Customer Details</h3>
          <p>
            <strong>Name:</strong> ${name}<br/>
            <strong>Email:</strong> ${email}<br/>
            <strong>Phone:</strong> ${phone}
          </p>
        </div>

        <div style="background: #eef2ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          ${appointmentInfoHTML}
        </div>

        <h3>Message</h3>
        <p style="background: #fff; padding: 10px; border: 1px solid #e5e7eb; border-radius: 4px;">${message}</p>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;"/>
        <p style="font-size: 12px; color: #888;">Received at ${new Date().toLocaleString()}</p>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Send Push Notification to Provider
    const { sendNotification } = require("../../utils/pushNotification");
    if (req.body.providerId) {
      await sendNotification(req.body.providerId, {
        title: "New Enquiry Received",
        body: `${name} sent an enquiry regarding ${petName || "your services"}.`,
        icon: "/pwa-192x192.png",
        type: "NEW_ENQUIRY",
        data: { url: "/profile" },
      });
    }

    res.status(200).json({
      success: true,
      message: "Enquiry sent successfully and appointment created!",
    });
  } catch (error) {
    console.error(
      "Error in server/controllers/enquiry/post.js (sendEnquiryEmail):",
      error,
    );
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
};

module.exports = { sendEnquiryEmail };
