import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import styles from "./heroSection.module.css";
import Button from "../../common/Button/Button";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.dogImageOverlay}>
          <img
            // src="https://png.pngtree.com/png-vector/20250111/ourmid/pngtree-golden-retriever-dog-pictures-png-image_15147078.png"
            src="/public/images/Home/Hero.png"
            alt="Happy dog"
          />
        </div>

        <h1 className={styles.heroTitle}>
          <span className={styles.titleLine}>
            Adopt L
            <span className={`${styles.badge} ${styles.petsBadge}`}>
              <div className={styles.heartContainer}>
                <Heart
                  size={130}
                  fill="var(--color-primary-400)"
                  color="var(--color-primary-400)"
                />
                <div className={styles.heartContent}>
                  <span className={styles.heartText}>Pets</span>
                  <span className={styles.heartNumber}>5k+</span>
                </div>
              </div>
            </span>
            ve,
          </span>
          <br />
          <span className={styles.titleLine}>
            f
            <span className={`${styles.badge} ${styles.doctorsBadge}`}>
              <span className={styles.badgeContent}>
                Doctors
                <span className={styles.badgeNumber}>2k+</span>
              </span>
            </span>
            ster happiness.
          </span>
        </h1>

        <div className={styles.heroContent}>
          <div className={styles.reviewsSection}>
            <div className={styles.reviewLabel}>Our happy pet owners</div>
            <div className={styles.rating}>
              <Star size={20} fill="#af8bfa" color="#af8bfa" />
              <span className={styles.ratingText}>4.8</span>
              <span className={styles.reviewCount}>(1.5k Reviews)</span>
            </div>
            <div className={styles.avatars}>
              <div className={styles.avatarGroup}>
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
                  alt="User"
                  className={styles.avatar}
                />
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                  alt="User"
                  className={styles.avatar}
                />
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                  alt="User"
                  className={styles.avatar}
                />
                <div className={styles.avatarMore}>+3k</div>
              </div>
            </div>
          </div>

          <div className={styles.heroImage}></div>

          <div className={styles.description}>
            <h3 className={styles.descriptionTitle}>What do we do?</h3>
            <p className={styles.descriptionText}>
              With a focus on matching the right pet with the right family,
              PetVault makes it easy to adopt love and foster happiness.
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/pet-adoption")}
              className={styles.ctaButton}
            >
              View pets
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
