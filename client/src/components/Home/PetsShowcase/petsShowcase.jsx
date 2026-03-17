// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Heart } from "lucide-react";
// import toast from 'react-hot-toast';// import { API_BASE_URL } from "../../../utils/constants";
// import styles from "./petsShowcase.module.css";
// import EnquiryModal from "../../PetAdoption/AdoptionEnquiryModal/adoptionEnquiryModal";

// const PetsShowcase = () => {
//   const [pets, setPets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPet, setSelectedPet] = useState(null);
//   const [showEnquiryModal, setShowEnquiryModal] = useState(false);

//   useEffect(() => {
//     fetchFeaturedPets();
//   }, []);

//   const fetchFeaturedPets = async () => {
//     try {
//       const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//       const response = await fetch(`${API_BASE_URL}/pets`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const featuredPets = (data.pets || []).filter(
//           (pet) => pet.featured === true
//         );
//         setPets(featuredPets);
//       } else {
//         toast.error("Failed to load featured pets");
//       }
//     } catch (error) {
//       console.error("Error fetching featured pets:", error);
//       toast.error("Error fetching featured pets");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEnquiry = (pet) => {
//     setSelectedPet(pet);
//     setShowEnquiryModal(true);
//   };

//   const handleEnquirySubmit = async (enquiryData) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/enquiries`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           ...enquiryData,
//           petId: selectedPet._id,
//           petName: selectedPet.name,
//         }),
//       });

//       if (response.ok) {
//         toast.success("Enquiry sent successfully!");
//         setShowEnquiryModal(false);
//         setSelectedPet(null);
//       } else {
//         toast.error("Failed to send enquiry");
//       }
//     } catch (error) {
//       toast.error("Failed to send enquiry");
//     }
//   };

//   if (loading) {
//     return <div className={styles.loading}>Loading pets...</div>;
//   }

//   return (
//     <section className={styles.showcase}>
//       <div className={styles.container}>
//         <div className={styles.header}>
//           <h2 className={styles.title}>Meet Our Featured Pets</h2>
//           <p className={styles.subtitle}>
//             Find your perfect companion from our most loved pets
//           </p>
//         </div>

//         {pets.length === 0 ? (
//           <div className={styles.emptyState}>
//             <p>No featured pets available right now.</p>
//           </div>
//         ) : (
//           <div className={styles.petsFlex}>
//             {pets.map((pet) => (
//               <div key={pet._id} className={styles.petCard}>
//                 <div className={styles.imageContainer}>
//                   {pet.images && pet.images.length > 0 ? (
//                     <img
//                       src={`http://localhost:5000/uploads/pets/${pet.images[0]}`}
//                       alt={pet.name}
//                       className={styles.petImage}
//                     />
//                   ) : (
//                     <div className={styles.noImage}>No Image</div>
//                   )}
//                   <button className={styles.heartButton}>
//                     <Heart size={20} />
//                   </button>
//                 </div>

//                 <div className={styles.petInfo}>
//                   <h3 className={styles.petName}>{pet.name}</h3>
//                   <p className={styles.petBreed}>{pet.breed}</p>
//                   <div className={styles.petDetails}>
//                     <span className={styles.petAge}>
//                       Age : {pet.age} {pet.ageUnit}
//                     </span>
//                   </div>

//                   <button
//                     className={styles.adoptButton}
//                     onClick={() => handleEnquiry(pet)}
//                   >
//                     {pet.category === "shop" ? "Buy Now" : "Adopt Now"}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         <div className={styles.ctaSection}>
//           <Link to="/pet-adoption" className={styles.ctaButton}>
//             View All Pets
//           </Link>
//         </div>
//       </div>

//       {showEnquiryModal && selectedPet && (
//         <EnquiryModal
//           pet={selectedPet}
//           onClose={() => {
//             setShowEnquiryModal(false);
//             setSelectedPet(null);
//           }}
//           onSubmit={handleEnquirySubmit}
//         />
//       )}
//     </section>
//   );
// };

// export default PetsShowcase;
import React, { useEffect, useState } from "react";
import { Star, Home, User, PawPrint } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL, BASE_URL } from "../../../utils/constants";
import styles from "./petsShowcase.module.css";
import { SectionHeader } from "../../common";

const PetsShowcase = () => {
  const [soldPets, setSoldPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPets();
  }, []);

  const fallbackPets = [
    {
      _id: "fallback-1",
      name: "Bella",
      breed: "Golden Retriever",
      images: [
        "https://images.unsplash.com/photo-1552053831-71594a27632d?w=500&q=80",
      ],
      ownerName: "Sarah Miller",
      review:
        "Bella has been such a blessing to our family. She's so gentle and loving!",
      rating: 5,
      ownerImage:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isFallback: true,
    },
    {
      _id: "fallback-2",
      name: "Max",
      breed: "German Shepherd",
      images: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDcwxuYIHbkarvPep6lKrBZB3jgbzrh4OO0g&s",
      ],
      ownerName: "David Chen",
      review:
        "Max is the perfect companion for my morning runs. So energetic and loyal!",
      rating: 5,
      ownerImage:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      isFallback: true,
    },
    {
      _id: "fallback-3",
      name: "Luna",
      breed: "Siamese Cat",
      images: [
        "https://cdn.shopify.com/s/files/1/1199/8502/files/Siamese-Cat-in.jpg?v=1669310440",
      ],
      ownerName: "Emily Wilson",
      review:
        "Luna is so graceful and affectionate. My home feels complete with her.",
      rating: 5,
      ownerImage:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      isFallback: true,
    },
  ];

  const fetchPets = async () => {
    try {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/pets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allPets = data.pets || [];

        const unavailablePets = allPets.filter(
          (pet) => pet.available === false,
        );

        let displayPets = unavailablePets;
        if (displayPets.length === 0) {
          displayPets = allPets.filter((pet) => pet.featured === true);
        }

        if (displayPets.length === 0) {
          setSoldPets(fallbackPets);
          return;
        }

        const mockData = [
          {
            ownerName: "Priya Sharma",
            review: (petName) =>
              `Adopting ${petName} was the best decision we ever made! ${petName} brought so much joy to our family !`,
            rating: 5,
            ownerImage:
              "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          },
          {
            ownerName: "Raj Patel",
            review: (petName) =>
              `Our ${petName} has been absolutely wonderful! Perfect addition to our Delhi home and family!`,
            rating: 5,
            ownerImage:
              "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
          },
          {
            ownerName: "Ananya Singh",
            review: (petName) =>
              `We are so grateful for our lovely ${petName}! They've filled our Bangalore home with love, joy and happiness!`,
            rating: 4,
            ownerImage:
              "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
          },
        ];

        const petsWithReviews = displayPets.slice(0, 3).map((pet, index) => ({
          ...pet,
          ownerName: mockData[index % mockData.length].ownerName,
          review: mockData[index % mockData.length].review(pet.name),
          rating: mockData[index % mockData.length].rating,
          ownerImage: mockData[index % mockData.length].ownerImage,
        }));

        setSoldPets(petsWithReviews);
      } else {
        setSoldPets(fallbackPets);
      }
    } catch (error) {
      console.error("Error fetching pets:", error);
      setSoldPets(fallbackPets);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        fill={
          index < rating ? "var(--color-warning)" : "var(--color-border-medium)"
        }
        color={
          index < rating ? "var(--color-warning)" : "var(--color-border-medium)"
        }
      />
    ));
  };

  if (loading) {
    return (
      <section className={styles.showcase}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <PawPrint size={24} className={styles.loadingIcon} />
            Loading happy stories...
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.showcase}>
      <div className={styles.container}>
        <SectionHeader
          className={styles.header}
          align="center"
          level="section"
          icon={<PawPrint size={32} className={styles.titleIcon} />}
          title="Happy Tails"
          subtitle="Meet our beloved pets who found their forever homes and the families who adore them."
        />

        {soldPets.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No happy stories to share right now.</p>
          </div>
        ) : (
          <div className={styles.petsFlex}>
            {soldPets.map((pet) => (
              <div key={pet._id} className={styles.petCard}>
                <div className={styles.petHeader}>
                  <div className={styles.petImages}>
                    {pet.images && pet.images.length > 0 ? (
                      <img
                        src={
                          pet.isFallback
                            ? pet.images[0]
                            : `${BASE_URL}/uploads/pets/${pet.images[0]}`
                        }
                        alt={pet.name}
                        className={styles.petImage}
                      />
                    ) : (
                      <div className={styles.noImage}>No Image</div>
                    )}
                    <div className={styles.ownerImageWrapper}>
                      <img
                        src={pet.ownerImage}
                        alt={pet.ownerName}
                        className={styles.ownerImage}
                      />
                      <User size={12} className={styles.userIcon} />
                    </div>
                  </div>
                  <div className={styles.petInfo}>
                    <h3 className={styles.petName}>{pet.name}</h3>
                    <p className={styles.petBreed}>{pet.breed}</p>
                    <p className={styles.ownerName}>
                      <User size={14} className={styles.ownerIcon} />
                      with {pet.ownerName}
                    </p>
                  </div>
                </div>

                <div className={styles.rating}>{renderStars(pet.rating)}</div>

                <p className={styles.reviewText}>"{pet.review}"</p>

                <div className={styles.adoptedBadge}>
                  <Home size={18} className={styles.homeIcon} />
                  Forever Home Found
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PetsShowcase;
