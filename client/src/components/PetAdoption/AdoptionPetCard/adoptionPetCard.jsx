import React from "react";
import styles from "./adoptionPetCard.module.css";
import { BASE_URL } from "../../../utils/constants";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, ListingCard } from "../../common";
const AdoptionPetCard = ({ pet, onView, onEnquiry }) => {
  const navigate = useNavigate();
  const handleCardClick = () => {
    if (onView) {
      onView(pet._id);
    } else {
      navigate(`/adoption-pet/${pet._id}`);
    }
  };
  const handleNgoClick = (e) => {
    e.stopPropagation();
    const ngoId = pet?.ngoId?._id || pet?.ngoId;
    if (ngoId) navigate(`/ngo/${ngoId}`);
  };
  return (
    <ListingCard
      onClick={handleCardClick}
      imageSrc={
        pet?.images?.length > 0
          ? `${BASE_URL}/uploads/pets/${pet.images[0]}`
          : ""
      }
      imageAlt={pet?.name}
      title={pet?.name}
      subtitle={pet?.breed}
      headerRight={
        pet?.ngoId ? (
          <Button
            type="button"
            className={styles.entityButton}
            onClick={handleNgoClick}
            variant="primary"
            size="md"
          >
            <Store size={13} />
            <span>{pet?.ngoId?.businessName || pet?.ngoId?.name || "NGO"}</span>
          </Button>
        ) : (
          <Badge variant="secondary" size="sm">
            NGO
          </Badge>
        )
      }
      context={
        <Badge
          variant={pet?.available ? "success-soft" : "error-soft"}
          size="sm"
        >
          {pet?.available ? "For Adoption" : "Adopted"}
        </Badge>
      }
      metaItems={[
        {
          label: pet?.type,
          textClassName: styles.metaText,
        },
        {
          label: `${pet?.age} ${pet?.ageUnit}`,
          textClassName: styles.metaText,
        },
      ]}
      as="div"
      footer={
        pet?.available ? (
          <Button
            fullWidth
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEnquiry && onEnquiry(pet);
            }}
            variant="primary"
          >
            Send Enquiry
          </Button>
        ) : null
      }
    />
  );
};
export default AdoptionPetCard;
