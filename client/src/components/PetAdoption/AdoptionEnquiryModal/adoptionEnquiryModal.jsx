import React, { useState } from "react";
import styles from "./adoptionEnquiryModal.module.css";
import { BASE_URL } from "../../../utils/constants";
import { Modal, Button, Input, Textarea } from "../../common";
const EnquiryModal = ({ pet, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    preferredDate: "",
    preferredTime: "",
  });
  const [loading, setLoading] = useState(false);
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Adoption Enquiry"
      size="xl"
      className={styles.standardizedModal}
    >
      <div className={styles.modalBody}>
        {/* Left Sidebar - Visual Interest */}
        <div className={styles.sidebar}>
          <div className={styles.sidebarContent}>
            <div className={styles.imageWrapper}>
              {pet.images?.length ? (
                <img
                  src={`${BASE_URL}/uploads/pets/${pet.images[0]}`}
                  alt={pet.name}
                />
              ) : (
                <div className={styles.noImage}>No Image</div>
              )}
            </div>

            <div className={styles.petInfo}>
              <h2>{pet.name}</h2>
              <p className={styles.breedInfo}>
                {pet.breed} • {pet.type}
              </p>

              {pet.price && Number(pet.price) > 0 ? (
                <div className={styles.priceTag}>Rs. {pet.price}</div>
              ) : (
                <div
                  className={styles.priceTag}
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  Adopt Your Forever Friend
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Main Content - Form */}
        <div className={styles.mainContent}>
          <div className={styles.formHeader}>
            <h5>Express your interest in adopting {pet.name}</h5>
          </div>

          <form
            id="enquiryForm"
            onSubmit={handleSubmit}
            className={styles.formWrapper}
          >
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter Your Name"
                  required
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="email"
                  label="Email Address"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Your Email"
                  required
                  fullWidth
                />
              </div>

              <div className={styles.formGroup}>
                <Input
                  type="tel"
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter Your Phone Number"
                  required
                  pattern="^[1-9][0-9]{9}$"
                  fullWidth
                />
              </div>

              <div className={styles.splitGroup}>
                <div className={styles.formGroup}>
                  <Input
                    type="date"
                    label="Date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    required
                    fullWidth
                  />
                </div>
                <div className={styles.formGroup}>
                  <Input
                    type="time"
                    label="Time"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    required
                    fullWidth
                  />
                </div>
              </div>
            </div>

            <div
              className={styles.formGroup}
              style={{
                marginTop: "1.2rem",
              }}
            >
              <Textarea
                label="Message"
                name="message"
                rows={3}
                value={formData.message}
                onChange={handleChange}
                placeholder="Why do you want to adopt this pet?"
                minLength={10}
                required
                fullWidth
              />
            </div>

            <div className={styles.formActions}>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
                disabled={loading}
                size="md"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                size="md"
              >
                {loading ? "Sending..." : "Send Enquiry"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};
export default EnquiryModal;
