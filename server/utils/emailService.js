const nodemailer = require("nodemailer");
const DeletionLog = require("../models/DeletionLog/deletionLog");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    // Don't throw, just log. We don't want to break the registration flow if email fails.
  }
};

const sendRegistrationConfirmation = async (email, name, role) => {
  const subject = "PetVault - Application Received";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #7c3aed;">Welcome to PetVault, ${name}!</h2>
      <p>Thank you for registering as a <strong>${role.toUpperCase()}</strong> on our platform.</p>
      
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #4b5563;">Application Status: <span style="color: #d97706;">PENDING REVIEW</span></h3>
        <p>We have received your KYC documents and details.</p>
      </div>

      <p>Our admin team will review your application within <strong>1-2 business days</strong>.</p>
      <p>You will receive another email once your account is approved. Until then, you will not be able to log in.</p>
      
      <p>If you have any questions, please reply to this email.</p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">© ${new Date().getFullYear()} PetVault. All rights reserved.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendApprovalEmail = async (email, name) => {
  const subject = "PetVault - Application Approved!";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Congratulations, ${name}!</h2>
      <p>Your application to join PetVault has been <strong>APPROVED</strong>.</p>
      
      <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <h3 style="margin-top: 0; color: #166534; border-bottom: 1px solid #b7f3cf; padding-bottom: 10px;">Account Active</h3>
        <p>You can now log in and start using all features of the platform.</p>
        
        <div style="margin-top: 15px; background: white; padding: 15px; border-radius: 6px; border: 1px solid #d1fae5;">
          <p style="margin: 0; font-size: 14px; color: #666;">Login Credentials:</p>
          <p style="margin: 5px 0 0 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
        </div>
      </div>

      <p style="font-size: 14px; color: #6b7280;">Please use the password you set during registration. If you've forgotten it, use the "Forgot Password" link on the login page.</p>

      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} PetVault. All rights reserved.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendRejectionEmail = async (email, name, reason) => {
  const subject = "PetVault - Application Update";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Application Update</h2>
      <p>Dear ${name},</p>
      <p>We regret to inform you that your application for PetVault has been <strong>REJECTED</strong>.</p>
      
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fca5a5;">
        <h3 style="margin-top: 0; color: #991b1b;">Reason for Rejection:</h3>
        <p style="color: #7f1d1d; font-style: italic;">"${reason}"</p>
      </div>

      <p>Please ensure all your documents are valid and clear. You may contact support at <a href="mailto:support@petvault.com">support@petvault.com</a> for further assistance.</p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">© ${new Date().getFullYear()} PetVault. All rights reserved.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendArchiveEmail = async (email, name) => {
  const subject = "PetVault - Account Access Blocked";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Account Access Update</h2>
      <p>Dear ${name},</p>
      <p>We are writing to inform you that your access to our platform has been <strong>BLOCKED</strong> and your account has been deactivated.</p>
      
      <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #fca5a5;">
        <h3 style="margin-top: 0; color: #991b1b;">Account Status: <span style="color: #dc2626;">DEACTIVATED</span></h3>
        <p>This action was taken by our administrative team. You will no longer be able to log in or use your account features.</p>
      </div>

      <p>If you believe this action was taken in error or if you have questions, please contact our support team at <a href="mailto:support@petvault.com">support@petvault.com</a>.</p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} PetVault. All rights reserved.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendUnarchiveEmail = async (email, name) => {
  const subject = "PetVault - Account Access Restored";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #16a34a;">Account Access Restored</h2>
      <p>Dear ${name},</p>
      <p>We are happy to inform you that your account access to PetVault has been <strong>RESTORED</strong>.</p>
      
      <div style="background-color: #dcfce7; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #86efac;">
        <h3 style="margin-top: 0; color: #166534;">Account Status: <span style="color: #16a34a;">ACTIVE</span></h3>
        <p>You can now log in and resume using all features of the platform.</p>
      </div>

      <p>If you have any questions, feel free to reach out to our support team.</p>
      
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 11px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} PetVault. All rights reserved.</p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

const sendProviderBookingNotificationEmail = async ({
  providerEmail,
  providerName,
  customerName,
  customerEmail,
  customerPhone,
  petName,
  petType,
  service,
  appointmentDate,
  appointmentTime,
  reason,
  appointmentId,
}) => {
  try {
    if (!providerEmail) {
      console.warn(
        "Skipping provider booking email: provider email is missing.",
      );
      return false;
    }

    const parsedDate = new Date(appointmentDate);
    const formattedDate = Number.isNaN(parsedDate.getTime())
      ? "N/A"
      : parsedDate.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

    const safeProviderName = escapeHtml(providerName || "Provider");
    const safeCustomerName = escapeHtml(customerName || "Pet Parent");
    const safeCustomerEmail = escapeHtml(customerEmail || "N/A");
    const safeCustomerPhone = escapeHtml(customerPhone || "N/A");
    const safePetName = escapeHtml(petName || "Pet");
    const safePetType = escapeHtml(petType || "N/A");
    const safeService = escapeHtml(service || "Appointment");
    const safeTime = escapeHtml(appointmentTime || "N/A");
    const safeReason = escapeHtml(reason || "Not provided");
    const safeAppointmentId = escapeHtml(
      appointmentId?.toString ? appointmentId.toString() : appointmentId || "",
    );

    const clientUrl = (process.env.CLIENT_URL || "").trim();
    const dashboardUrl = clientUrl
      ? `${clientUrl}/profile?tab=appointments`
      : "";

    const subject = "PetVault - New Appointment Request";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 640px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-top: 0;">New Appointment Request</h2>
        <p>Hello ${safeProviderName},</p>
        <p>You have received a new appointment request on PetVault.</p>

        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Appointment ID:</strong> ${safeAppointmentId || "N/A"}</p>
          <p style="margin: 0 0 8px 0;"><strong>Service:</strong> ${safeService}</p>
          <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${safeTime}</p>
          <p style="margin: 0;"><strong>Reason:</strong> ${safeReason}</p>
        </div>

        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Pet:</strong> ${safePetName} (${safePetType})</p>
          <p style="margin: 0 0 8px 0;"><strong>Booked By:</strong> ${safeCustomerName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${safeCustomerEmail}</p>
          <p style="margin: 0;"><strong>Phone:</strong> ${safeCustomerPhone}</p>
        </div>

        ${
          dashboardUrl
            ? `<p style="margin: 20px 0;"><a href="${dashboardUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;">View Appointments</a></p>`
            : ""
        }

        <p style="margin-top: 20px;">Please respond to this request from your provider dashboard.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="font-size: 12px; color: #6b7280;">This is an automated email from PetVault.</p>
      </div>
    `;

    await sendEmail(providerEmail, subject, html);
    return true;
  } catch (error) {
    console.error(
      "Error in server/utils/emailService.js (sendProviderBookingNotificationEmail):",
      error,
    );
    return false;
  }
};

const sendDeletionNotificationEmail = async (deletionLog) => {
  try {
    const {
      listing_details,
      listing_type,
      listing_image,
      deletion_reason,
      owner_email,
      createdAt,
    } = deletionLog;

    const listingName =
      listing_details.name ||
      listing_details.title ||
      `${listing_type} listing`;
    const formattedDate = new Date(createdAt).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Construct image URL if available
    // Assuming images are hosted at process.env.BASE_URL/uploads/products/ or /pets/
    let imageUrl = null;
    if (listing_image) {
      const folder = listing_type === "product" ? "products" : "pets";
      imageUrl = `${process.env.SERVER_URL}/uploads/${folder}/${listing_image}`;
    }

    const mailOptions = {
      from: `"Pet Vault Admin" <${process.env.EMAIL_USER}>`,
      to: owner_email,
      subject: `Action Required: Your ${listing_type} listing has been removed`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
            .content { padding: 20px; }
            .product-preview { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding: 10px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
            .product-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; background: #eee; }
            .product-info h3 { margin: 0 0 5px 0; font-size: 16px; color: #111; }
            .product-info p { margin: 0; font-size: 12px; color: #6b7280; }
            .reason-box { background: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444; margin-bottom: 20px; }
            .reason-title { color: #b91c1c; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .reason-text { color: #7f1d1d; font-size: 14px; margin: 0; }
            .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            .action-btn { display: inline-block; padding: 10px 20px; background: #4b5563; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Listing Removed</h1>
            </div>
            
            <div class="content">
              <p style="margin-top: 0; margin-bottom: 15px; font-size: 14px;">Hello,</p>
              <p style="margin-bottom: 20px; font-size: 14px;">We're writing to let you know that we've removed one of your listings because it violates our community guidelines.</p>
              
              <div class="product-preview">
                ${
                  imageUrl
                    ? `<img src="${imageUrl}" alt="Item image" class="product-img" onerror="this.style.display='none'"/>`
                    : '<div class="product-img" style="display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:20px;">📦</div>'
                }
                <div class="product-info">
                  <h3>${listingName}</h3>
                  <p>Type: ${listing_type.toUpperCase()} • Removed on ${formattedDate.split(",")[0]}</p>
                </div>
              </div>
              
              <div class="reason-box">
                <div class="reason-title">Reason for Removal</div>
                <p class="reason-text">${deletion_reason}</p>
              </div>

              <p style="font-size: 13px; color: #4b5563; margin-bottom: 5px;">If you believe this is a mistake, please contact our support team.</p>
              <center>
                <a href="mailto:${process.env.EMAIL_USER}?subject=Appeal Removal: ${listingName}" class="action-btn">Contact Support</a>
              </center>
            </div>
            
            <div class="footer">
              &copy; ${new Date().getFullYear()} Pet Vault. All rights reserved.<br>
              This is an automated administrative notification.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(
      "Error in server/utils/emailService.js (sendDeletionNotificationEmail):",
      error,
    );
    throw error;
  }
};

/**
 * Process deletion email queue with retry logic
 */
const processDeletionEmailQueue = async (deletionLogId, maxRetries = 3) => {
  try {
    const deletionLog = await DeletionLog.findById(deletionLogId);

    if (!deletionLog) {
      console.error(`Deletion log ${deletionLogId} not found`);
      return;
    }

    if (deletionLog.email_sent) {
      console.log(`Email already sent for deletion log ${deletionLogId}`);
      return;
    }

    if (deletionLog.email_retry_count >= maxRetries) {
      console.error(
        `Max retries reached for deletion log ${deletionLogId}. Manual intervention required.`,
      );
      return;
    }

    try {
      await sendDeletionNotificationEmail(deletionLog);

      // Update deletion log on success
      deletionLog.email_sent = true;
      deletionLog.email_sent_at = new Date();
      deletionLog.email_error = null;
      await deletionLog.save();

      console.log(
        `✅ Deletion notification email sent successfully for ${deletionLog.listing_type} to ${deletionLog.owner_email}`,
      );
    } catch (emailError) {
      // Update retry count and error
      deletionLog.email_retry_count += 1;
      deletionLog.email_error = emailError.message;
      await deletionLog.save();

      console.error(
        `❌ Failed to send deletion email (Attempt ${deletionLog.email_retry_count}/${maxRetries}):`,
        emailError.message,
      );

      // Retry after delay if not max retries
      if (deletionLog.email_retry_count < maxRetries) {
        setTimeout(() => {
          processDeletionEmailQueue(deletionLogId, maxRetries);
        }, 5000 * deletionLog.email_retry_count); // Exponential backoff
      }
    }
  } catch (error) {
    console.error(
      "Error in server/utils/emailService.js (processDeletionEmailQueue):",
      error,
    );
  }
};

const sendRestoreNotificationEmail = async (
  email,
  name,
  listingType,
  listingName,
  listingImage,
) => {
  try {
    const formattedDate = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

    let imageUrl = null;
    if (listingImage) {
      const folder = listingType === "product" ? "products" : "pets";
      imageUrl = `${process.env.SERVER_URL}/uploads/${folder}/${listingImage}`;
    }

    const mailOptions = {
      from: `"Pet Vault Admin" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Good News: Your ${listingType} listing has been restored!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.5; color: #333; margin: 0; padding: 0; background-color: #f3f4f6; }
            .container { max-width: 500px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; } /* Green for Success */
            .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
            .content { padding: 20px; }
            .product-preview { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; padding: 10px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
            .product-img { width: 60px; height: 60px; object-fit: cover; border-radius: 6px; background: #eee; }
            .product-info h3 { margin: 0 0 5px 0; font-size: 16px; color: #111; }
            .product-info p { margin: 0; font-size: 12px; color: #6b7280; }
            .success-box { background: #dcfce7; padding: 15px; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 20px; }
            .success-title { color: #15803d; font-weight: 700; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
            .success-text { color: #14532d; font-size: 14px; margin: 0; }
            .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
            .action-btn { display: inline-block; padding: 10px 20px; background: #16a34a; color: white; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Listing Restored!</h1>
            </div>
            
            <div class="content">
              <p style="margin-top: 0; margin-bottom: 15px; font-size: 14px;">Hello ${name},</p>
              <p style="margin-bottom: 20px; font-size: 14px;">We're happy to inform you that your listing is now back online and visible on Pet Vault.</p>
              
              <div class="product-preview">
                ${
                  imageUrl
                    ? `<img src="${imageUrl}" alt="Item image" class="product-img" onerror="this.style.display='none'"/>`
                    : '<div class="product-img" style="display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:20px;">📦</div>'
                }
                <div class="product-info">
                  <h3>${listingName}</h3>
                  <p>Type: ${listingType.toUpperCase()} • Restored on ${formattedDate.split(",")[0]}</p>
                </div>
              </div>
              
              <div class="success-box">
                <div class="success-title">Status Update</div>
                <p class="success-text">This item is now <strong>Active</strong> and available to users.</p>
              </div>

              <p style="font-size: 13px; color: #4b5563; margin-bottom: 5px;">You can view and manage your listing in your dashboard.</p>
            </div>
            
            <div class="footer">
              &copy; ${new Date().getFullYear()} Pet Vault. All rights reserved.<br>
              This is an automated administrative notification.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(
      "Error in server/utils/emailService.js (sendRestoreNotificationEmail):",
      error,
    );
    // Don't throw, just log error so restore process doesn't fail strictly due to email failure
  }
};

const sendPayoutRequestSubmittedEmail = async ({
  providerEmail,
  providerName,
  amount,
  netAmount,
  platformFeePercent,
  platformFeeAmount,
  bankName,
  accountNumberMasked,
  etaText,
}) => {
  try {
    if (!providerEmail) return false;

    const safeName = escapeHtml(providerName || "Provider");
    const safeAmount = escapeHtml(Number(amount || 0).toFixed(2));
    const safeNetAmount = escapeHtml(
      Number(netAmount || amount || 0).toFixed(2),
    );
    const safePlatformFeePercent = escapeHtml(
      Number(platformFeePercent || 0).toFixed(2),
    );
    const safePlatformFeeAmount = escapeHtml(
      Number(platformFeeAmount || 0).toFixed(2),
    );
    const safeBank = escapeHtml(bankName || "Bank Account");
    const safeAccount = escapeHtml(accountNumberMasked || "");
    const safeEta = escapeHtml(etaText || "1-2 business days");

    const subject = "PetVault - Payout Request Received";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 620px; margin: 0 auto;">
        <h2 style="color: #2563eb; margin-top: 0;">Payout Request Received</h2>
        <p>Hello ${safeName},</p>
        <p>We have received your payout request.</p>
        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Requested Amount:</strong> ₹${safeAmount}</p>
          <p style="margin: 0 0 8px 0;"><strong>Platform Fee (${safePlatformFeePercent}%):</strong> ₹${safePlatformFeeAmount}</p>
          <p style="margin: 0 0 8px 0;"><strong>Net Disbursement:</strong> ₹${safeNetAmount}</p>
          <p style="margin: 0 0 8px 0;"><strong>Payout Account:</strong> ${safeBank} ${safeAccount ? `(${safeAccount})` : ""}</p>
          <p style="margin: 0;"><strong>Expected Processing Time:</strong> ${safeEta}</p>
        </div>
        <p>You will receive a status update once admin reviews and processes the request.</p>
        <p style="font-size: 12px; color: #6b7280;">Note: Payout disbursements are processed on business days (Monday to Friday).</p>
      </div>
    `;

    await sendEmail(providerEmail, subject, html);
    return true;
  } catch (error) {
    console.error(
      "Error in server/utils/emailService.js (sendPayoutRequestSubmittedEmail):",
      error,
    );
    return false;
  }
};

const sendPayoutStatusUpdateEmail = async ({
  providerEmail,
  providerName,
  amount,
  netAmount,
  platformFeePercent,
  platformFeeAmount,
  status,
  reference,
  paymentMode,
  utrNumber,
  transactionId,
  adminNote,
  etaText,
}) => {
  try {
    if (!providerEmail) return false;

    const safeName = escapeHtml(providerName || "Provider");
    const safeAmount = escapeHtml(Number(amount || 0).toFixed(2));
    const safeNetAmount = escapeHtml(
      Number(netAmount || amount || 0).toFixed(2),
    );
    const safePlatformFeePercent = escapeHtml(
      Number(platformFeePercent || 0).toFixed(2),
    );
    const safePlatformFeeAmount = escapeHtml(
      Number(platformFeeAmount || 0).toFixed(2),
    );
    const safeStatus = escapeHtml(
      String(status || "")
        .replace(/_/g, " ")
        .toUpperCase(),
    );
    const safeReference = escapeHtml(reference || "");
    const safePaymentMode = escapeHtml(
      String(paymentMode || "")
        .replace(/_/g, " ")
        .toUpperCase(),
    );
    const safeUtrNumber = escapeHtml(utrNumber || "");
    const safeTransactionId = escapeHtml(transactionId || "");
    const safeAdminNote = escapeHtml(adminNote || "");
    const safeEta = escapeHtml(etaText || "1-2 business days");

    const statusCopy = {
      approved: `Your payout request has been approved and will be processed within ${safeEta}.`,
      processing: `Your payout is currently in processing. Expected timeline: ${safeEta}.`,
      disbursed: "Your payout has been disbursed successfully.",
      rejected: "Your payout request has been rejected.",
      cancelled: "Your payout request has been cancelled.",
      pending: "Your payout request is pending review.",
    };

    const subject = `PetVault - Payout ${safeStatus}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 620px; margin: 0 auto;">
        <h2 style="color: #7c3aed; margin-top: 0;">Payout Status Updated</h2>
        <p>Hello ${safeName},</p>
        <p>${statusCopy[String(status || "").toLowerCase()] || "Your payout status has been updated."}</p>
        <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; margin: 16px 0;">
          <p style="margin: 0 0 8px 0;"><strong>Requested Amount:</strong> ₹${safeAmount}</p>
          <p style="margin: 0 0 8px 0;"><strong>Platform Fee (${safePlatformFeePercent}%):</strong> ₹${safePlatformFeeAmount}</p>
          <p style="margin: 0 0 8px 0;"><strong>Net Disbursement:</strong> ₹${safeNetAmount}</p>
          <p style="margin: 0 0 8px 0;"><strong>Status:</strong> ${safeStatus}</p>
          ${
            safeReference
              ? `<p style="margin: 0 0 8px 0;"><strong>Reference:</strong> ${safeReference}</p>`
              : ""
          }
          ${
            safePaymentMode
              ? `<p style="margin: 0 0 8px 0;"><strong>Payment Mode:</strong> ${safePaymentMode}</p>`
              : ""
          }
          ${
            safeUtrNumber
              ? `<p style="margin: 0 0 8px 0;"><strong>UTR Number:</strong> ${safeUtrNumber}</p>`
              : ""
          }
          ${
            safeTransactionId
              ? `<p style="margin: 0 0 8px 0;"><strong>Transaction ID:</strong> ${safeTransactionId}</p>`
              : ""
          }
          ${
            safeAdminNote
              ? `<p style="margin: 0;"><strong>Admin Note:</strong> ${safeAdminNote}</p>`
              : ""
          }
        </div>
        <p style="font-size: 12px; color: #6b7280;">Payouts are processed on business days only (Monday to Friday).</p>
      </div>
    `;

    await sendEmail(providerEmail, subject, html);
    return true;
  } catch (error) {
    console.error(
      "Error in server/utils/emailService.js (sendPayoutStatusUpdateEmail):",
      error,
    );
    return false;
  }
};

const sendPetSaleConfirmationEmail = async (email, name, petName, petImage) => {
  const subject = `Congratulations on your new companion, ${petName}!`;
  let imageUrl = null;
  if (petImage) {
    imageUrl = `${process.env.SERVER_URL}/uploads/pets/${petImage}`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; line-height: 1.6;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #7c3aed; margin-bottom: 5px;">Congratulations!</h1>
        <p style="font-size: 18px; color: #4b5563;">You have a new family member!</p>
      </div>

      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-bottom: 25px; text-align: center;">
        ${
          imageUrl
            ? `<img src="${imageUrl}" alt="${petName}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 15px;">`
            : ""
        }
        <h2 style="color: #111827; margin: 0;">${petName}</h2>
        <p style="color: #6b7280; margin: 5px 0;">Has been officially added to your pet profiles.</p>
      </div>

      <p>Dear ${name},</p>
      <p>We are absolutely thrilled to inform you that <strong>${petName}</strong> has been marked as sold to you and is now officially part of your PetVault family!</p>
      
      <p>You can now manage ${petName}'s health records, reminders, and more through your "My Pets" dashboard.</p>

      <div style="margin-top: 25px; text-align: center;">
        <a href="${process.env.CLIENT_URL}/profile?tab=mypets" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">View My Pets</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
      <p style="font-size: 12px; color: #6b7280; text-align: center;">
        PetVault - Connecting Pets with Loving Families<br>
        © ${new Date().getFullYear()} PetVault. All rights reserved.
      </p>
    </div>
  `;
  await sendEmail(email, subject, html);
};

module.exports = {
  processDeletionEmailQueue,
  sendRegistrationConfirmation,
  sendApprovalEmail,
  sendRejectionEmail,
  sendArchiveEmail,
  sendUnarchiveEmail,
  sendProviderBookingNotificationEmail,
  sendDeletionNotificationEmail,
  sendRestoreNotificationEmail,
  sendPayoutRequestSubmittedEmail,
  sendPayoutStatusUpdateEmail,
  sendPetSaleConfirmationEmail,
};
