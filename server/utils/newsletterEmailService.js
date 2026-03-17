const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: `"PetVault Newsletter" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Newsletter email sent to ${to}`);
  } catch (error) {
    console.error(`Failed to send newsletter email to ${to}:`, error);
  }
};

const petTips = [
  "Did you know? Dogs have a unique nose print, much like a human's fingerprint!",
  "Cats sleep for 13 to 16 hours a day (almost 70% of their life). Avoid disturbing them abruptly.",
  "A tired dog is a happy dog. Ensure at least 30 minutes of daily exercise.",
  "Chocolate, grapes, raisins, and onions are toxic to dogs. Keep them out of reach.",
  "Cats may purr when stressed or in pain as a self-soothing mechanism.",
  "Check your pet's paw pads in summer. Hot pavement can cause burns.",
  "Brushing your dog's teeth regularly can significantly improve lifespan.",
  "Provide fresh, clean water for your pets at all times.",
  "Regular vet checkups help detect health issues early.",
  "Microchipping increases the chance of finding a lost pet.",
  "Overfeeding can lead to obesity and joint problems.",
  "Dogs need mental stimulation just as much as physical exercise.",
  "Cats groom themselves daily, but brushing reduces hairballs.",
  "Keep toxic houseplants like lilies away from cats.",
  "Socialization from a young age helps prevent behavioral issues.",
  "Avoid giving cooked bones to dogs; they can splinter.",
  "Indoor cats still need playtime to prevent boredom.",
  "Spaying or neutering can reduce health risks and unwanted behavior.",
  "Clean your pet’s bedding weekly to prevent infections.",
  "Trim your pet’s nails regularly to avoid joint strain.",
  "Watch for sudden appetite changes — they may signal illness.",
  "Provide scratching posts for cats to protect furniture.",
  "Use pet-safe shampoos only; human products can irritate skin.",
  "Dental treats can help reduce plaque buildup.",
  "Keep trash bins secured to prevent accidental ingestion.",
  "Ear cleaning prevents infections, especially in floppy-eared dogs.",
  "Vaccinations protect pets from serious diseases.",
  "Avoid sudden diet changes; transition gradually over 7 days.",
  "Senior pets need more frequent health monitoring.",
  "Interactive toys reduce anxiety and boredom.",
  "Always use a leash in unfamiliar outdoor areas.",
  "Cats knead as a sign of comfort and trust.",
  "Provide shade and cooling during hot weather.",
  "Winter walks may require protective clothing for small breeds.",
  "Keep electrical cords out of reach of curious pets.",
  "Regular grooming reduces shedding and skin issues.",
  "Never leave pets in parked cars.",
  "Healthy treats should not exceed 10% of daily calories.",
  "Training sessions should be short and positive.",
  "Hydration is especially important after exercise.",
  "Whiskers help cats navigate tight spaces.",
  "Use slow feeders for pets that eat too quickly.",
  "Sudden lethargy should never be ignored.",
  "Puppies require more frequent meals than adult dogs.",
  "Cats prefer clean litter boxes; scoop daily.",
  "ID tags should always be updated with current contact info.",
  "Chew toys help maintain dental health in dogs.",
  "Provide vertical climbing spaces for indoor cats.",
  "Fleas and ticks can transmit serious diseases.",
  "Positive reinforcement works better than punishment.",
  "A balanced diet supports immune health.",
  "Monitor your pet’s weight monthly.",
  "Sudden behavior changes may indicate stress.",
  "Provide a quiet resting area for your pet.",
  "Cats communicate through tail and ear positions.",
  "Routine deworming is essential for puppies and kittens.",
  "Play strengthens the bond between you and your pet.",
  "Avoid giving dairy to lactose-intolerant pets.",
  "Bath frequency depends on breed and activity level.",
  "Senior dogs benefit from joint supplements.",
  "Never use essential oils without vet guidance.",
  "Keep cleaning supplies stored safely away.",
  "Cats need high-protein diets as obligate carnivores.",
  "Dogs can get sunburned, especially light-colored breeds.",
  "Reward calm behavior consistently.",
  "Rotate toys to keep pets engaged.",
  "Check gums regularly; pale gums may indicate anemia.",
  "Keep vaccinations up to date.",
  "Provide enrichment puzzles for intelligent breeds.",
  "Do not ignore excessive scratching.",
  "Hydration supports kidney health in cats.",
  "Introduce new pets slowly and carefully.",
  "Routine blood work helps detect hidden issues.",
  "Ensure collars fit properly — not too tight.",
  "Avoid human medications unless prescribed by a vet.",
  "Daily walks reduce anxiety in dogs.",
  "Cats may hide when they are unwell.",
  "Regular brushing prevents matting in long-haired breeds.",
  "Provide safe chew alternatives during teething.",
  "Keep balconies secured for indoor cats.",
  "Annual dental cleanings may be necessary.",
  "Healthy social exposure builds confidence.",
  "Monitor stool changes for digestive issues.",
  "Use pet carriers for safe travel.",
  "Keep vaccination records organized.",
  "Early training builds lifelong good habits.",
  "Provide calcium-balanced diets for growing pets.",
  "Keep antifreeze away; it is highly toxic.",
  "Clean food bowls daily to prevent bacteria growth.",
  "Avoid overexertion in hot climates.",
  "Regular exercise improves cardiovascular health.",
  "Recognize signs of heatstroke early.",
  "Never force interactions between pets.",
  "Provide mental games during rainy days.",
  "Cats use scent marking to feel secure.",
  "Schedule wellness exams even if your pet seems healthy.",
  "A healthy pet is an active, alert, and curious companion.",
];

const getRandomTip = () => petTips[Math.floor(Math.random() * petTips.length)];

const generatePetTipHtml = (tip) => `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PetVault Monthly Tip</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; line-height: 1.6;">
    <div style="max-width: 600px; padding: 20px; font-size: 15px;">
      <h2 style="color: #6d28d9; margin-top: 0; font-size: 20px;">
        PetVault Monthly Tip
      </h2>
      
      <p style="margin-bottom: 20px;">Here is your pet tip for this month:</p>
      
      <blockquote style="margin: 0 0 20px 0; border-left: 3px solid #6d28d9; color: #333333; padding: 15px; font-style: italic;">
        ${tip}
      </blockquote>
      
      <p style="margin-bottom: 25px;">Small improvements in daily care routines can significantly improve your pet’s long-term health and happiness.</p>
      
      <p style="margin-bottom: 30px;">
        <a href="${process.env.CLIENT_URL || "#"}" style="background-color: #6d28d9; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 14px;">Explore PetVault</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.5;">
        You’re receiving this email because you subscribed to PetVault updates.<br />
        © ${new Date().getFullYear()} PetVault. All rights reserved.<br />
        <a href="${process.env.CLIENT_URL || "#"}/profile" style="color: #6d28d9; text-decoration: none;">Manage your preferences</a>
      </p>
    </div>
  </body>
  </html>
`;

const sendWelcomeTipEmail = async (email) => {
  const tip = getRandomTip();
  const subject = "Welcome to PetVault Newsletter! Here's your first tip";
  const html = generatePetTipHtml(tip);
  await sendEmail(email, subject, html);
};

const sendMonthlyTipEmail = async (email) => {
  const tip = getRandomTip();
  const subject = "PetVault Monthly Insights: New Pet Tip Inside!";
  const html = generatePetTipHtml(tip);
  await sendEmail(email, subject, html);
};

const sendCustomNewsletterEmail = async (email, subject, content) => {
  // Convert basic newlines to <br/> for simpler text rendering
  const formattedContent = String(content).replace(/\n/g, "<br/>");

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>PetVault Update</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; color: #333333; line-height: 1.6;">
    <div style="max-width: 600px; padding: 20px; font-size: 15px;">
      <h2 style="color: #6d28d9; margin-top: 0; font-size: 20px;">
        PetVault Update
      </h2>
      
      <div style="margin-bottom: 25px;">
        ${formattedContent}
      </div>
      
      <p style="margin-bottom: 30px;">
        <a href="${process.env.CLIENT_URL || "#"}" style="background-color: #6d28d9; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 14px;">Visit PetVault</a>
      </p>
      
      <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;" />
      
      <p style="font-size: 12px; color: #999999; margin: 0; line-height: 1.5;">
        You’re receiving this email because you subscribed to PetVault updates.<br />
        © ${new Date().getFullYear()} PetVault. All rights reserved.<br />
        <a href="${process.env.CLIENT_URL || "#"}/profile" style="color: #6d28d9; text-decoration: none;">Manage your preferences</a>
      </p>
    </div>
  </body>
  </html>
  `;
  await sendEmail(email, subject, html);
};

module.exports = {
  sendWelcomeTipEmail,
  sendMonthlyTipEmail,
  sendCustomNewsletterEmail,
};
