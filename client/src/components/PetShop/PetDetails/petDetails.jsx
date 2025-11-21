import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import { toast } from "react-toastify";
import EnquiryModal from "../EnquiryModal/enquiryModal";
import styles from "./petDetails.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";

const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPetDetails();
    }
  }, [id]);

  const fetchPetDetails = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/pets/${id}?populate=shopId`
      );

      if (response.ok) {
        const data = await response.json();
        setPet(data.pet || data);
      } else if (response.status === 404) {
        toast.error("Pet not found");
      } else {
        toast.error("Failed to fetch pet details");
      }
    } catch (error) {
      toast.error("Failed to fetch pet details");
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = () => {
    if (pet.shopId && pet.shopId._id) {
      navigate(`/shop/${pet.shopId._id}`);
    } else {
      toast.info("Shop information not available");
    }
  };

  const handleEnquirySubmit = async (enquiryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/enquiries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...enquiryData,
          petId: pet._id,
          petName: pet.name,
        }),
      });

      if (response.ok) {
        toast.success("Enquiry sent successfully!");
        setShowEnquiryModal(false);
      } else {
        toast.error("Failed to send enquiry");
      }
    } catch (error) {
      toast.error("Failed to send enquiry");
    }
  };

  const formatDescription = (description) => {
    if (!description) return [];

    const points = description
      .split(/[•\n,-]/)
      .map((point) => point.trim())
      .filter((point) => point.length > 0);

    return points;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading pet details...</p>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className={styles.notFound}>
        <h2>Pet Not Found</h2>
        <p>
          The pet you're looking for doesn't exist or may have been removed.
        </p>
        <button
          className={styles.backButton}
          onClick={() => navigate("/pet-shop")}
        >
          <ArrowLeft size={20} />
          Back to Pet Shop
        </button>
      </div>
    );
  }

  const descriptionPoints = formatDescription(pet.description);

  return (
    <div className={styles.petDetails}>
      <div className={styles.container}>
        <button
          className={styles.backButton}
          onClick={() => navigate("/pet-shop")}
        >
          <ArrowLeft size={20} />
          Back to Pets
        </button>

        <div className={styles.content}>
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              {pet.images && pet.images.length > 0 ? (
                <img
                  src={`${BASE_URL}/uploads/pets/${pet.images?.[selectedImage]}`}
                  alt={pet.name}
                />
              ) : (
                <div className={styles.noImage}>No Image Available</div>
              )}
            </div>

            {pet.images && pet.images.length > 1 && (
              <div className={styles.imageThumbnails}>
                {pet.images.map((image, index) => (
                  <button
                    key={index}
                    className={`${styles.thumbnail} ${
                      selectedImage === index ? styles.active : ""
                    }`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={`${API_BASE_URL}/uploads/pets/${image}`}
                      alt={`${pet.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Shop Section */}
            {pet.shopId && (
              <div className={styles.shopSection} onClick={handleShopClick}>
                <Store size={18} />
                <div className={styles.shopInfo}>
                  <span className={styles.shopName}>
                    {pet.shopId.businessName ||
                      pet.shopId.name ||
                      "Unknown Shop"}
                  </span>
                  <span className={styles.viewShop}>View Shop →</span>
                </div>
              </div>
            )}

            <div className={styles.characteristics}>
              <h3>Health & Care</h3>
              <div className={styles.traits}>
                {pet.vaccinated && (
                  <span className={styles.trait}>✓ Vaccinated</span>
                )}
                {pet.healthChecked && (
                  <span className={styles.trait}>✓ Health Checked</span>
                )}
                {pet.microchipped && (
                  <span className={styles.trait}>✓ Microchipped</span>
                )}
                {pet.neutered && (
                  <span className={styles.trait}>✓ Neutered</span>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.enquiryButton}
                onClick={() => setShowEnquiryModal(true)}
                disabled={!pet.available}
              >
                Send Enquiry
              </button>
              {!pet.available && (
                <p className={styles.soldText}>
                  This pet is no longer available
                </p>
              )}
            </div>
          </div>

          <div className={styles.detailsSection}>
            <div className={styles.header}>
              <div>
                <h1>{pet.name}</h1>
                <p className={styles.breed}>{pet.breed}</p>
              </div>
              <div className={styles.status}>
                <span
                  className={`${styles.statusBadge} ${
                    pet.available ? styles.available : styles.sold
                  }`}
                >
                  {pet.available ? "Available" : "Sold"}
                </span>
              </div>
            </div>

            <div className={styles.price}>Rs. {pet.price}</div>

            <div className={styles.quickInfo}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Type:</span>
                <span className={styles.value}>{pet.type}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Gender:</span>
                <span className={styles.value}>{pet.gender}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Age:</span>
                <span className={styles.value}>
                  {pet.age} {pet.ageUnit}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Color:</span>
                <span className={styles.value}>
                  {pet.color || "Not specified"}
                </span>
              </div>
            </div>

            {descriptionPoints.length > 0 && (
              <div className={styles.description}>
                <h3>About {pet.name}</h3>
                <ul className={styles.descriptionList}>
                  {descriptionPoints.map((point, index) => (
                    <li key={index} className={styles.descriptionItem}>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEnquiryModal && pet && (
        <EnquiryModal
          pet={pet}
          onClose={() => setShowEnquiryModal(false)}
          onSubmit={handleEnquirySubmit}
        />
      )}
    </div>
  );
};

export default PetDetails;
