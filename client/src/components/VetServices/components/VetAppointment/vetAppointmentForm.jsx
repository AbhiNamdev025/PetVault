import React, { useEffect, useMemo, useState } from "react";
import * as Icons from "lucide-react";
import { PawPrint as PawIcon, Phone, User } from "lucide-react";
import toast from "react-hot-toast";
import styles from "./vetAppointmentForm.module.css";
import { API_BASE_URL } from "../../../../utils/constants";
import { AppointmentFlow, AppointmentScheduleSelector, Button, Input, Select, Textarea, toDisplayDate, toDisplayTime } from "../../../common";
import flowStyles from "../../../common/AppointmentFlow/appointmentFlow.module.css";
import { fetchPlatformFeeConfig, getPlatformFeePercent, roundCurrency } from "../../../../utils/platformFee";
import useCoins from "../../../../hooks/useCoins";
import CoinRedeem from "../../../common/CoinRedeem/coinRedeem";
const petOptions = [{
  value: "Dog",
  label: "Dog",
  icon: "PawPrint"
}, {
  value: "Cat",
  label: "Cat",
  icon: "Cat"
}, {
  value: "Bird",
  label: "Bird",
  icon: "Feather"
}, {
  value: "Others",
  label: "Others",
  icon: "HelpCircle"
}];
const BOOKING_STEPS = [{
  id: "schedule",
  label: "Date & Time"
}, {
  id: "details",
  label: "Pet Details"
}, {
  id: "review",
  label: "Confirmation"
}, {
  id: "done",
  label: "Confirmed"
}];
const VetAppointmentForm = ({
  doctorId,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [doctor, setDoctor] = useState(null);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  const [petImageFiles, setPetImageFiles] = useState([]);
  const [previewPetImages, setPreviewPetImages] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [platformConfig, setPlatformConfig] = useState(null);
  const {
    balance: coinBalance,
    rate: coinRate
  } = useCoins();
  const [coinsToUse, setCoinsToUse] = useState(0);
  const APPOINTMENT_MAX_PERCENT = 5;
  const APPOINTMENT_MAX_COINS_ABS = 100;
  const [formData, setFormData] = useState({
    providerType: "doctor",
    providerId: doctorId,
    service: "vet",
    petName: "",
    petType: "",
    parentPhone: "",
    date: "",
    time: "",
    reason: "",
    healthIssues: ""
  });
  const providerFee = doctor?.roleData?.consultationFee || 400;
  const feePercent = getPlatformFeePercent(doctor?.role || "doctor", platformConfig);
  const platformFee = roundCurrency(providerFee * feePercent / 100);
  const totalPayable = roundCurrency(providerFee + platformFee);
  const maxCoinsByPercent = Math.floor(totalPayable * (coinRate || 10) * (APPOINTMENT_MAX_PERCENT / 100));
  const maxCoins = Math.min(maxCoinsByPercent, APPOINTMENT_MAX_COINS_ABS, Math.max(0, Number(coinBalance) || 0));
  const safeCoins = Math.max(0, Math.min(coinsToUse, coinBalance, maxCoins));
  const coinDiscount = roundCurrency(safeCoins / (coinRate || 10));
  const finalPayable = roundCurrency(Math.max(0, totalPayable - coinDiscount));
  useEffect(() => {
    if (coinsToUse !== safeCoins) {
      setCoinsToUse(safeCoins);
    }
  }, [coinsToUse, safeCoins]);
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) return;
      try {
        const res = await fetch(`${API_BASE_URL}/doctor/${doctorId}`);
        const data = await res.json();
        setDoctor(data);
      } catch {
        toast.error("Failed to load doctor details");
      }
    };
    const fetchUserPets = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/user-pets`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setUserPets(data);
        }
      } catch (error) {
        console.error("Error fetching user pets", error);
      }
    };
    fetchDoctor();
    fetchUserPets();
    fetchPlatformFeeConfig().then(config => setPlatformConfig(config)).catch(() => null);
  }, [doctorId]);
  const handleChange = e => setFormData(previous => ({
    ...previous,
    [e.target.name]: e.target.value
  }));
  const handleSelectPet = value => setFormData(previous => ({
    ...previous,
    petType: value
  }));
  const handleUserPetSelect = e => {
    const petId = e.target.value;
    setSelectedPetId(petId);
    if (!petId) return;
    const pet = userPets.find(item => item._id === petId);
    if (!pet) return;
    setFormData(previous => ({
      ...previous,
      petName: pet.name,
      petType: pet.species,
      healthIssues: (pet.medicalConditions || []).join(", ")
    }));
  };
  const handleImageSelect = e => {
    const files = Array.from(e.target.files || []);
    setPetImageFiles(files);
    setPreviewPetImages(files.map(file => URL.createObjectURL(file)));
  };
  const isValidPhone = useMemo(() => /^[1-9][0-9]{9}$/.test(formData.parentPhone || ""), [formData.parentPhone]);
  const canProceed = useMemo(() => {
    if (step === 1) {
      return Boolean(formData.date && formData.time);
    }
    if (step === 2) {
      return Boolean(formData.petName.trim() && formData.petType && isValidPhone && formData.reason.trim());
    }
    return true;
  }, [formData.date, formData.petName, formData.petType, formData.reason, formData.time, isValidPhone, step]);
  const handleNext = () => {
    if (step === 1 && !canProceed) {
      toast.error("Select appointment date and time.");
      return;
    }
    if (step === 2 && !canProceed) {
      toast.error("Complete pet details before continuing.");
      return;
    }
    setStep(previous => Math.min(previous + 1, BOOKING_STEPS.length));
  };
  const handleBack = () => {
    if (step === 1) {
      onClose?.();
      return;
    }
    setStep(previous => Math.max(previous - 1, 1));
  };
  const submitBooking = async () => {
    setIsLoading(true);
    try {
      if (!formData.providerId) {
        toast.error("Please select a doctor first.");
        return null;
      }
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      petImageFiles.forEach(file => payload.append("petImages", file));
      if (selectedPetId) {
        payload.append("petId", selectedPetId);
      }
      if (coinsToUse > 0) {
        payload.append("coinsToUse", coinsToUse);
      }
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: payload
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to book appointment");
        return null;
      }
      toast.success("Vet appointment booked successfully");
      return data;
    } catch {
      toast.error("Error booking appointment");
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  const handleConfirm = async () => {
    const appointment = await submitBooking();
    if (!appointment) return;
    setBookedAppointment(appointment);
    setStep(4);
  };
  const resetWizard = () => {
    setStep(1);
    setBookedAppointment(null);
    setPetImageFiles([]);
    setPreviewPetImages([]);
    setCoinsToUse(0);
    setSelectedPetId("");
    setFormData({
      providerType: "doctor",
      providerId: doctorId,
      service: "vet",
      petName: "",
      petType: "",
      parentPhone: "",
      date: "",
      time: "",
      reason: "",
      healthIssues: ""
    });
  };
  const IconFor = (name, props = {}) => {
    const Component = Icons[name];
    if (!Component) return <span {...props} />;
    return <Component {...props} />;
  };
  const titles = {
    1: {
      title: "Choose Date and Time",
      subtitle: "Pick the best slot for the consultation."
    },
    2: {
      title: "Share Pet Information",
      subtitle: "Fill patient details and health issues."
    },
    3: {
      title: "Confirmation",
      subtitle: "Review details and apply coins before booking."
    },
    4: {
      title: "Appointment Confirmed",
      subtitle: "Your vet booking has been scheduled successfully."
    }
  };
  return <div className={styles.formContainer}>
      <AppointmentFlow steps={BOOKING_STEPS} currentStep={step} title={titles[step].title} subtitle={titles[step].subtitle} canProceed={canProceed} isSubmitting={isLoading} onBack={handleBack} onNext={handleNext} onConfirm={handleConfirm} confirmLabel="Book Appointment">
        {step === 1 && <AppointmentScheduleSelector date={formData.date} time={formData.time} onDateChange={value => setFormData(previous => ({
        ...previous,
        date: value
      }))} onTimeChange={value => setFormData(previous => ({
        ...previous,
        time: value
      }))} minDate={new Date()} />}

        {step === 2 && <>
            <div className={styles.form}>
              {userPets.length > 0 && <Select label="Auto-fill from My Pets" value={selectedPetId} onChange={handleUserPetSelect} options={userPets.map(pet => ({
            value: pet._id,
            label: `${pet.name} (${pet.species})`
          }))} placeholder="-- Manual Entry --" icon={<PawIcon size={20} />} className={styles.formGroup} fullWidth />}

              <Input label="Pet Name" name="petName" value={formData.petName} onChange={handleChange} placeholder="Enter pet name" required icon={<User size={20} />} className={styles.formGroup} fullWidth />

              <div className={styles.formGroup}>
                <label className={styles.label}>Pet Type</label>
                <div className={styles.petOptionsRow} role="radiogroup" aria-label="Pet Type">
                  {petOptions.map(option => {
                const selected = formData.petType === option.value;
                return <Button type="button" key={option.value} className={`${styles.petOption} ${selected ? styles.petOptionActive : ""}`} onClick={() => handleSelectPet(option.value)} aria-pressed={selected} variant="primary" size="md">
                        <span className={styles.petIcon}>
                          {IconFor(option.icon, {
                      size: 18
                    })}
                        </span>
                        <span className={styles.petLabel}>{option.label}</span>
                      </Button>;
              })}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Add Pet Images</label>
                <input type="file" multiple onChange={handleImageSelect} className={styles.fileInput} accept="image/*" />

                {previewPetImages.length > 0 && <div className={styles.previewRow}>
                    {previewPetImages.map((src, index) => <img key={`${src}-${index}`} src={src} className={styles.previewImg} alt={`preview-${index}`} />)}
                  </div>}
              </div>

              <Input label="Parent Mobile" type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} placeholder="10-digit mobile number" pattern="^[1-9][0-9]{9}$" required fullWidth icon={<Phone size={20} />} />

              <Textarea label="Health Issues" name="healthIssues" rows={2} value={formData.healthIssues} onChange={handleChange} placeholder="Describe any health issues" className={styles.formGroup} fullWidth />

              <Textarea label="Reason for Visit" name="reason" rows={3} value={formData.reason} onChange={handleChange} placeholder="Describe reason for visit" required className={styles.formGroup} fullWidth />
            </div>
          </>}

        {step === 3 && <>
            <CoinRedeem balance={coinBalance} rate={coinRate} value={coinsToUse} maxCoins={maxCoins} onChange={setCoinsToUse} label="Apply Pet Vault Coins" helper={`${coinRate || 10} coins = ₹1 • Max 5% • Refunded if cancelled`} />

            <div className={flowStyles.reviewLayout}>
              <div className={flowStyles.reviewGrid}>
                <div className={flowStyles.reviewItem}>
                  <p className={flowStyles.reviewLabel}>Doctor</p>
                  <p className={flowStyles.reviewValue}>
                    {doctor?.roleData?.doctorName || doctor?.name || "Vet Doctor"}
                  </p>
                </div>

                <div className={flowStyles.reviewItem}>
                  <p className={flowStyles.reviewLabel}>Patient</p>
                  <p className={flowStyles.reviewValue}>
                    {formData.petName} ({formData.petType})
                  </p>
                </div>

                <div className={flowStyles.reviewItem}>
                  <p className={flowStyles.reviewLabel}>Contact</p>
                  <p className={flowStyles.reviewValue}>{formData.parentPhone}</p>
                </div>

                <div className={flowStyles.reviewItem}>
                  <p className={flowStyles.reviewLabel}>Date & Time</p>
                  <p className={flowStyles.reviewValue}>
                    {toDisplayDate(formData.date)} • {toDisplayTime(formData.time)}
                  </p>
                </div>

                <div className={flowStyles.reviewItem}>
                  <p className={flowStyles.reviewLabel}>Reason</p>
                  <p className={flowStyles.reviewValue}>{formData.reason}</p>
                </div>

                {formData.healthIssues && <div className={flowStyles.reviewItem}>
                    <p className={flowStyles.reviewLabel}>Health Issues</p>
                    <p className={flowStyles.reviewValue}>{formData.healthIssues}</p>
                  </div>}

                <div className={flowStyles.checkList}>
                  <div className={flowStyles.checkItem}>
                    <Icons.Check size={15} /> Provider receives your request instantly.
                  </div>
                  <div className={flowStyles.checkItem}>
                    <Icons.Check size={15} /> You can track status from appointments.
                  </div>
                </div>
              </div>

              <div className={flowStyles.feeCard}>
                <h4 className={flowStyles.feeTitle}>Fee Breakdown</h4>
                <div className={flowStyles.feeRow}>
                  <span>Consultation Fee</span>
                  <span>₹{providerFee.toFixed(2)}</span>
                </div>
                <div className={flowStyles.feeRow}>
                  <span>Platform Fee ({feePercent}%)</span>
                  <span>₹{platformFee.toFixed(2)}</span>
                </div>
                {coinDiscount > 0 && <div className={flowStyles.feeRow}>
                    <span>Coin Discount</span>
                    <span>-₹{coinDiscount.toFixed(2)}</span>
                  </div>}
                <div className={`${flowStyles.feeRow} ${flowStyles.feeTotal}`}>
                  <span>Total Payable</span>
                  <span>₹{finalPayable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </>}

        {step === 4 && <div className={flowStyles.successCard}>
            <div className={flowStyles.successIcon}>
              <Icons.Check size={36} />
            </div>
            <h4 className={flowStyles.successTitle}>Appointment Booked</h4>
            <p className={flowStyles.successText}>
              Your consultation request has been submitted successfully.
            </p>

            <div className={flowStyles.successMeta}>
              <div className={flowStyles.reviewItem}>
                <p className={flowStyles.reviewLabel}>Doctor</p>
                <p className={flowStyles.reviewValue}>
                  {doctor?.roleData?.doctorName || doctor?.name || "Vet Doctor"}
                </p>
              </div>
              <div className={flowStyles.reviewItem}>
                <p className={flowStyles.reviewLabel}>Schedule</p>
                <p className={flowStyles.reviewValue}>
                  {toDisplayDate(formData.date)} • {toDisplayTime(formData.time)}
                </p>
              </div>
              {bookedAppointment?._id && <div className={flowStyles.reviewItem}>
                  <p className={flowStyles.reviewLabel}>Booking ID</p>
                  <p className={flowStyles.reviewValue}>
                    #{bookedAppointment._id.slice(-8).toUpperCase()}
                  </p>
                </div>}
            </div>

            <div className={flowStyles.successActions}>
              <Button type="button" variant="secondary" className={flowStyles.secondaryBtn} onClick={resetWizard} size="md">
                Book Another
              </Button>
              <Button type="button" variant="primary" className={flowStyles.successBtn} onClick={onClose} size="md">
                Done
              </Button>
            </div>
          </div>}
      </AppointmentFlow>
    </div>;
};
export default VetAppointmentForm;
