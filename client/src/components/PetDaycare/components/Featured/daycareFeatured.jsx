import React from "react";
import styles from "./daycareFeatured.module.css";

const features = [
  {
    title: "Safe & Hygienic Environment",
    text: "Our daycare ensures your pet enjoys a spotless, fully sanitized, and climate-controlled space. Every corner is cleaned and disinfected regularly to maintain a germ-free zone.",
    text2:
      "Our trained caregivers monitor your pet throughout the day, ensuring safety, comfort, and constant supervision.",
    img: "https://thedogdazzlers.com.au/wp-content/uploads/2024/09/Dog-Daycare-for-active-dogs.jpeg",
  },
  {
    title: "Playtime & Socialization",
    text: "Your pet will enjoy interactive toys, outdoor activities, and fun-filled playgroups with friendly companions.",
    text2:
      "We encourage positive social behavior, helping your dog build confidence and release happy energy while staying active.",
    img: "https://d2zp5xs5cp8zlg.cloudfront.net/image-44398-800.jpg",
  },
  {
    title: "Personalized Feeding & Nap Time",
    text: "We follow your pet’s unique meal plan and rest schedule so they feel right at home — even when you’re away.",
    text2:
      "Every pet has a cozy, private rest area to recharge after play sessions, ensuring they stay relaxed and happy.",
    img: "https://mymodernmet.com/wp/wp-content/uploads/2020/11/doggie-daycare-puppy-spring-20.jpg",
  },
  {
    title: "Trained & Loving Staff",
    text: "Our dedicated team is trained in pet first aid, behavior handling, and emotional care. Every staff member treats your pet like family.",
    text2:
      "Whether it’s a cuddle, a walk, or a treat — your furry friend is in caring hands all day long.",
    img: "https://www.bluespringsanimalhospital.com/sites/default/files/inline-images/Doggie-Daycare-Playtime-Staff-Blue-Springs-Pet-Resort-Kansas-City.jpg",
  },
  {
    title: "Regular Updates & Photos",
    text: "Stay connected! We send you real-time updates, photos, and short clips of your pet’s day so you never miss a moment.",
    text2:
      "It’s our way of making sure you feel just as comfortable as your pet while they’re here.",
    img: "https://www.buddypets.co.in/wp-content/uploads/2019/03/Puppy-boarding-facility.jpg",
  },
];

const DaycareFeatured = () => {
  return (
    <section className={styles.featured}>
      {features.map((item, index) => (
        <div
          key={index}
          className={`${styles.feature} ${
            index % 2 !== 0 ? styles.reverse : ""
          }`}
        >
          <img src={item.img} alt={item.title} className={styles.image} />
          <div className={styles.textContent}>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.text}>{item.text}</p>
            <p className={styles.text}>{item.text2}</p>
          </div>
        </div>
      ))}
    </section>
  );
};

export default DaycareFeatured;
