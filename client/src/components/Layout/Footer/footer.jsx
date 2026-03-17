import React, { useState } from "react";
import { API_BASE_URL } from "../../../utils/constants";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PawPrint,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send,
  MailPlus,
  Loader2,
} from "lucide-react";
import Input from "../../common/Input/Input";
import styles from "./footer.module.css";

export const SocialMediaData = [
  {
    title: "Facebook",
    image: "/socialMedia/facebook.svg",
    redirect: "#",
  },
  {
    title: "LinkedIn",
    image: "/socialMedia/linkdin.svg",
    redirect: "#",
  },
  {
    title: "YouTube",
    image: "/socialMedia/youtu.svg",
    redirect: "#",
  },
  {
    title: "Twitter",
    image: "/socialMedia/Twitter.svg",
    redirect: "#",
  },
];

const Footer = ({ setTermsAndConditionsPopup }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Subscribed successfully!");
        setEmail("");
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const goHomeSmooth = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <div className={styles.brand}>
              <PawPrint className={styles.footerLogo} />
              <h3>PetVault</h3>
            </div>

            <p className={styles.tagline}>
              Your trusted partner in pet care, health, and happiness.
              Connecting pet parents, NGOs, vets, shops, and daycare —
              seamlessly.
            </p>
          </div>

          <div className={styles.middleGroup}>
            <div className={styles.footerSection}>
              <h4>Contact Info</h4>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <Phone size={16} />
                  <span>+91 9876543210</span>
                </div>
                <div className={styles.contactItem}>
                  <Mail size={16} />
                  <span>petvault@gmail.com</span>
                </div>
                <div className={styles.contactItem}>
                  <MapPin size={16} />
                  <span>Naraingarh, India</span>
                </div>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h4>Subscribe Now</h4>
              <p className={styles.newsletterDesc}>
                Subscribe to get beautiful, randomized pet tips delivered to
                your inbox every month!
              </p>
              <form
                onSubmit={handleSubscribe}
                className={styles.newsletterForm}
              >
                <Input
                  type="email"
                  placeholder="Enter Your Email"
                  className={styles.newsletterInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  icon={<MailPlus size={18} className={styles.mailIcon} />}
                  rightElement={
                    <button
                      type="submit"
                      className={styles.submitButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className={styles.spin} size={18} />
                      ) : (
                        <Send size={18} />
                      )}
                    </button>
                  }
                />
              </form>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <div className={styles.bottomContent}>
            <div className={styles.copyrightSectionRow}>
              <div className={styles.copyrightItem}>
                <span className={styles.link} onClick={goHomeSmooth}>
                  Pet Vault
                </span>
                <span className={styles.separator}>|</span>
                <span
                  className={styles.link}
                  onClick={() => setTermsAndConditionsPopup?.(true)}
                >
                  Terms & Conditions
                </span>
              </div>
              <span className={styles.separatorDesktop}>|</span>
              <div className={styles.copyrightItem}>
                Powered by{" "}
                <a
                  href="https://codroidhub.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CodroidHub
                </a>
                in association with
                <span className={styles.separatorSmall}>&nbsp;&&nbsp;</span>
                <a
                  href="https://devarshinnovations.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Devarsh Innovations
                </a>
              </div>
              <span className={styles.separatorDesktop}>|</span>
              <div className={styles.copyrightItem}>
                © {new Date().getFullYear()} All rights reserved
              </div>
            </div>

            <div className={styles.socialIcons}>
              {SocialMediaData.map((item, index) => (
                <a
                  key={index}
                  rel="noopener noreferrer"
                  href={item.redirect}
                  aria-label={item.title}
                  className={styles.iconWrapper}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.icon}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
