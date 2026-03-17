import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Plus,
  Minus,
  Mars,
  Venus,
  Clock,
  Palette,
  Syringe,
  ShieldCheck,
  Heart,
} from "lucide-react";
import styles from "./petDetails.module.css";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import {
  Button,
  DetailBackButton,
  DetailEntityCard,
  DetailMediaGallery,
  DetailPage,
  DetailSplitCard,
} from "../../common";
import { openAuthModal } from "../../../utils/authModalNavigation";
import { DetailsSkeleton } from "../../Skeletons";
const PetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);
  const location = useLocation();
  const isUserLoggedIn = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/pets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setPet(data.pet || data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);
  if (loading) return <DetailsSkeleton />;
  if (!pet) return null;
  const aboutList = pet.description
    ? pet.description
        .split(/\n|•/)
        .map((v) => v.trim())
        .filter(Boolean)
    : [];
  const petImages = (pet.images || []).map(
    (img) => `${BASE_URL}/uploads/pets/${img}`,
  );
  const normalizedGender =
    typeof pet.gender === "string" ? pet.gender.toLowerCase() : "";
  const displayGender = normalizedGender
    ? normalizedGender.charAt(0).toUpperCase() + normalizedGender.slice(1)
    : "Unknown";
  const fallbackImage =
    "https://t4.ftcdn.net/jpg/04/70/29/97/360_F_470299797_UD0eoVMMSUbHCcNJCdv2t8B2g1GVqYgs.jpg";
  return (
    <DetailPage>
      <DetailBackButton
        onClick={() => {
          if (location.state?.from) {
            navigate(location.state.from, { state: location.state });
          } else {
            navigate(-1);
          }
        }}
      />

      <DetailSplitCard
        gallery={
          <DetailMediaGallery
            images={petImages}
            selectedIndex={selectedImage}
            onSelect={setSelectedImage}
            fallbackSrc={fallbackImage}
            alt={pet.name}
          />
        }
        content={
          <div className={styles.info}>
            {/* HEADER */}
            <div className={styles.headerRow}>
              <div className={styles.typeRow}>
                <h1 className={styles.name}>{pet.name}</h1>
                <p className={styles.type}>{pet.type}</p>
              </div>

              <div className={styles.priceBox}>
                <div className={styles.price}>Rs. {pet.price}</div>
                <span className={styles.available}>Available</span>
              </div>
            </div>

            {/* CHIPS */}
            <div className={styles.tags}>
              <span className={styles.tag}>
                {normalizedGender === "male" ? <Mars /> : <Venus />}{" "}
                {displayGender}
              </span>
              <span className={styles.tag}>
                <Clock /> {pet.age} {pet.ageUnit}
              </span>
              <span className={styles.tag}>
                <Palette /> {pet.color}
              </span>
            </div>

            {/* ABOUT */}
            <div className={styles.accordion}>
              <Button
                className={`${styles.accordionHeader} ${aboutOpen ? styles.activeHeader : ""}`}
                onClick={() => setAboutOpen(!aboutOpen)}
                variant="ghost"
                size="md"
                usePresetStyle
              >
                {aboutOpen ? <Minus /> : <Plus />} About {pet.name}
              </Button>

              {aboutOpen && (
                <ul className={styles.aboutList}>
                  {aboutList.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* PET INFO */}
            <div className={styles.accordion}>
              <Button
                className={`${styles.accordionHeader} ${infoOpen ? styles.activeHeader : ""}`}
                onClick={() => setInfoOpen(!infoOpen)}
                variant="ghost"
                size="md"
                usePresetStyle
              >
                {infoOpen ? <Minus /> : <Plus />} Pet Information
              </Button>

              {infoOpen && (
                <div className={styles.petInfoBox}>
                  <div className={styles.infoRow}>
                    <Syringe />
                    <span>Vaccinated : {pet.vaccinated ? "Yes" : "No"}</span>
                  </div>

                  <div className={styles.infoRow}>
                    <ShieldCheck />
                    <span>Dewormed : {pet.dewormed ? "Yes" : "No"}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ACTIONS – ALWAYS BOTTOM */}
            <div className={styles.actions}>
              <Button className={styles.wishlist} variant="primary" size="md">
                <Heart size={16} /> Add to Wishlist
              </Button>

              <Button
                className={styles.actionButton}
                onClick={() => {
                  if (!isUserLoggedIn()) {
                    openAuthModal(navigate, {
                      location,
                      view: "login",
                      from: location.pathname,
                    });
                    return;
                  }
                  const shopId =
                    typeof pet.shopId === "string"
                      ? pet.shopId
                      : pet.shopId?._id;
                  if (!shopId) return;
                  const petType =
                    typeof pet.type === "string" && pet.type.length > 0
                      ? pet.type.charAt(0).toUpperCase() + pet.type.slice(1)
                      : "";
                  navigate(
                    `/book/shop?providerId=${shopId}&service=shop&mode=enquiry&petId=${pet._id}&petName=${encodeURIComponent(pet.name || "")}&petType=${encodeURIComponent(petType)}`,
                    {
                      state: {
                        from: `/shop-pets/${id}`,
                        petContext: {
                          id: pet._id,
                          name: pet.name || "",
                          type: petType,
                        },
                      },
                    },
                  );
                }}
                variant="primary"
                size="md"
                fullWidth
                usePresetStyle
              >
                Send Inquiry
              </Button>
            </div>
          </div>
        }
      />

      {pet.shopId && (
        <DetailEntityCard
          avatarSrc={
            pet.shopId.avatar
              ? `${BASE_URL}/uploads/avatars/${pet.shopId.avatar}`
              : "https://img.freepik.com/free-vector/shop-with-sign-open-design_23-2148544029.jpg"
          }
          avatarAlt={pet.shopId.businessName || pet.shopId.name}
          title={pet.shopId.businessName || pet.shopId.name}
          subtitle="Verified Pet Shop"
          badges={["Responds within 24 hrs", "Quality Assured"]}
          ctaText="View Shop →"
          onClick={() => navigate(`/shop/${pet.shopId._id}`)}
        />
      )}
    </DetailPage>
  );
};
export default PetDetails;
