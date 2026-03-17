import React from "react";
import { Store } from "lucide-react";
import { BASE_URL } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { CatalogCard } from "../../common";

const PetCard = ({ pet, onEnquiry }) => {
  const navigate = useNavigate();
  const petType =
    typeof pet.type === "string" && pet.type.trim().length > 0
      ? pet.type.charAt(0).toUpperCase() + pet.type.slice(1).toLowerCase()
      : "Type N/A";
  const ageLabel =
    pet.age !== undefined && pet.age !== null && String(pet.age).trim().length > 0
      ? `${pet.age} ${pet.ageUnit || ""}`.trim()
      : "Age N/A";

  const handleCardClick = () => {
    navigate(`/shop-pets/${pet._id}`);
  };

  const handleEnquiryClick = (e) => {
    e.stopPropagation();
    onEnquiry(pet);
  };

  const handleShopClick = (e) => {
    e.stopPropagation();
    const shopId = typeof pet.shopId === "string" ? pet.shopId : pet.shopId?._id;
    if (shopId) {
      navigate(`/shop/${shopId}`);
    }
  };

  return (
    <CatalogCard
      onClick={handleCardClick}
      imageSrc={
        pet.images?.length > 0 ? `${BASE_URL}/uploads/pets/${pet.images[0]}` : ""
      }
      imageAlt={pet.name}
      title={pet.name}
      subtitle={pet.breed}
      ownerLabel={
        pet.shopId?.businessName || pet.shopId?.name || "Pet Vault"
      }
      ownerIcon={<Store size={13} />}
      onOwnerClick={pet.shopId?._id ? handleShopClick : undefined}
      priceLabel={`Rs. ${pet.price}`}
      metaItems={[{ label: petType }, { label: ageLabel }]}
      actionLabel="Send Enquiry"
      onAction={handleEnquiryClick}
    />
  );
};

export default PetCard;
