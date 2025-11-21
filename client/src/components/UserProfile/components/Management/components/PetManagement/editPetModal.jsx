import React, { useState, useEffect } from "react";
import styles from "./petManagement.module.css";
import { API_BASE_URL } from "../../../../../../utils/constants";
import { toast } from "react-toastify";

const EditPetModal = ({ pet, onClose, onUpdated }) => {
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const isNgo = savedUser?.role === "ngo";
  const idKey = isNgo ? "ngoId" : "shopId";

  const [form, setForm] = useState({
    name: pet.name,
    type: pet.type,
    breed: pet.breed,
    age: pet.age,
    ageUnit: pet.ageUnit,
    gender: pet.gender,
    price: pet.price,
    color: pet.color,
    description: pet.description,
    vaccinated: pet.vaccinated,
    available: pet.available,
    category: pet.category,
    featured: pet.featured,
  });

  const [images, setImages] = useState([]);
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => (document.body.style.overflow = "auto");
  }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    fd.append(idKey, savedUser._id);
    images.forEach((img) => fd.append("petImages", img));

    try {
      const res = await fetch(`${API_BASE_URL}/pets/${pet._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error();
      toast.success("Pet updated");
      onUpdated();
      onClose();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalBox}>
        <h3>Edit Pet</h3>

        <input name="name" value={form.name} onChange={change} />

        <select name="type" value={form.type} onChange={change}>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="rabbit">Rabbit</option>
          <option value="fish">Fish</option>
          <option value="other">Other</option>
        </select>

        <input name="breed" value={form.breed} onChange={change} />
        <input name="age" value={form.age} onChange={change} />

        <select name="ageUnit" value={form.ageUnit} onChange={change}>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>

        <select name="gender" value={form.gender} onChange={change}>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {!isNgo && <input name="price" value={form.price} onChange={change} />}

        <input name="color" value={form.color} onChange={change} />
        <textarea
          name="description"
          value={form.description}
          onChange={change}
        />

        <input
          type="file"
          multiple
          onChange={(e) => setImages([...e.target.files])}
        />

        <div className={styles.modalActions}>
          <button onClick={submit}>Update</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default EditPetModal;
