import React from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import styles from "./footer.module.css";

const Footer = () => {
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
              Your trusted partner in pet care, health, and happiness. Every pet
              deserves love, attention, and the best care.
            </p>
            <div className={styles.socialLinks}>
              <a href="#" className={styles.socialLink}>
                <Facebook size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Twitter size={20} />
              </a>
              <a href="#" className={styles.socialLink}>
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className={styles.middleGroup}>
            <div className={styles.footerSection}>
              <h4>Quick Links</h4>
              <div className={styles.links}>
                <Link to="/pet-shop">Pet Shop</Link>
                <Link to="/vet-services">Vet Services</Link>
                <Link to="/pet-adoption">Adoption</Link>
                <Link to="/pet-daycare">Daycare</Link>
                <Link to="/pet-products">Products</Link>
              </div>
            </div>

            <div className={styles.footerSection}>
              <h4>Services</h4>
              <div className={styles.links}>
                <Link to="/vet-services">Veterinary Care</Link>
                <Link to="/pet-daycare">Pet Daycare</Link>
                <Link to="/pet-adoption">Pet Adoption</Link>
                <Link to="/pet-products">Pet Products</Link>
                <Link to="/pet-shop">Pet Shopping</Link>
              </div>
            </div>
          </div>

          <div className={styles.footerSection}>
            <h4>Contact Info</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <Phone size={16} />
                <span>+91 9876543210</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={16} />
                <span>PetVault@gmail.com</span>
              </div>
              <div className={styles.contactItem}>
                <MapPin size={16} />
                <span>32 Naraingarh, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2025 PetVault. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
