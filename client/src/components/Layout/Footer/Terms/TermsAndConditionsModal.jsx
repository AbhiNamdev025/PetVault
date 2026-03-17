import React, { useState, useEffect } from "react";
import Modal from "../../../common/Modal/Modal";
import styles from "./LegalModals.module.css";
import { Button, Checkbox } from "../../../common";
import { API_BASE_URL } from "../../../../utils/constants";
import toast from "react-hot-toast";

const TermsAndConditionsModal = ({ isOpen, onClose }) => {
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token && isOpen) {
      fetch(`${API_BASE_URL}/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.hasAcceptedTerms) {
            setHasAccepted(true);
            setIsCheckboxChecked(true);
          } else {
            setHasAccepted(false);
            setIsCheckboxChecked(false);
          }
        })
        .catch((err) => console.error("Error fetching user profile:", err));
    }
  }, [isOpen]);

  const handleAcceptAndClose = async () => {
    if (!isLoggedIn) {
      onClose();
      return;
    }

    if (hasAccepted) {
      onClose();
      return;
    }

    if (!isCheckboxChecked) {
      toast.error("Please check the box to accept the terms");
      return;
    }

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE_URL}/user/accept-terms`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        toast.success("Terms accepted successfully");
        setHasAccepted(true);
        onClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to accept terms");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="User Agreement & Terms of Service"
      size="lg"
      hideContentPadding
    >
      <div className={styles.legalContent}>
        <div className={styles.intro}>
          <p>Effective Date: February 17, 2024</p>
          <p>
            Welcome to Pet Vault. These terms explain how you can use our
            website, mobile app, and services. By creating an account or using
            the platform, you agree to follow these terms.
          </p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionNum}>Article 1</span>
          <h3>What Pet Vault Does</h3>
          <p>
            Pet Vault is a digital platform that connects pet owners with
            independent service providers. Services on the platform may include:
          </p>
          <ul className={styles.pointList}>
            <li>Veterinary consultations and medical support</li>
            <li>Adoption and animal welfare services</li>
            <li>Grooming, boarding, and daycare</li>
            <li>Pet products and supplies</li>
          </ul>
          <div className={styles.disclaimerBox}>
            <p>
              Pet Vault does not provide medical treatment directly and only
              acts as a connecting platform.
            </p>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionNum}>Article 2</span>
          <h3>Your Responsibilities</h3>
          <p>
            You must provide correct and complete information about yourself and
            your pet. False information may lead to account suspension or
            removal.
          </p>
          <ul className={styles.pointList}>
            <li>
              <strong>Account Safety:</strong> You are responsible for all
              activity on your account.
            </li>
            <li>
              <strong>Legal Use:</strong> Follow all animal welfare laws and
              behave responsibly.
            </li>
            <li>
              <strong>Fair Use:</strong> Do not bypass the platform to arrange
              services privately.
            </li>
          </ul>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionNum}>Article 3</span>
          <h3>Bookings and Payments</h3>
          <p>
            Appointments depend on provider availability. Pet Vault only helps
            with scheduling and payments. The actual service agreement is
            between you and the provider.
          </p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionNum}>Article 4</span>
          <h3>Medical Disclaimer</h3>
          <p>
            Any information on Pet Vault, including AI suggestions or community
            advice, is for general guidance only and is not a replacement for
            professional veterinary care.
          </p>
          <p>
            In an emergency, contact a licensed veterinarian or emergency clinic
            immediately.
          </p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionNum}>Article 5</span>
          <h3>Content and Ownership</h3>
          <p>
            All platform design, logos, and software belong to Pet Vault. You
            keep ownership of your pet photos and data, but allow us to display
            them to operate the platform.
          </p>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionNum}>Article 6</span>
          <h3>Limitation of Liability</h3>
          <p>
            Pet Vault is not responsible for issues caused by third-party
            providers, service outcomes, or reliance on platform information.
          </p>
        </div>

        {isLoggedIn && !hasAccepted && (
          <div className={styles.acceptanceRow}>
            <Checkbox
              checked={isCheckboxChecked}
              onChange={(e) => setIsCheckboxChecked(e.target.checked)}
              label="I have read and agree to the Terms of Service"
            />
          </div>
        )}

        <div className={styles.footerActions}>
          {isLoggedIn && !hasAccepted ? (
            <>
              <Button onClick={onClose} variant="ghost" size="md">
                Cancel
              </Button>
              <Button
                onClick={handleAcceptAndClose}
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                disabled={!isCheckboxChecked}
              >
                Accept & Close
              </Button>
            </>
          ) : (
            <Button onClick={onClose} variant="primary" size="md">
              Close
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TermsAndConditionsModal;
