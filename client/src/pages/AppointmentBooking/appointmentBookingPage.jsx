import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import ServiceBookingForm from "../../components/PetDaycare/components/ServicesBooking/serviceBookingForm";
import { BookAppointmentModal } from "../../components/Appointments";
import styles from "./appointmentBookingPage.module.css";
import { Button, SectionHeader } from "../../components/common";
import ConfirmationModal from "../../components/ConfirmationModal/ConfirmationModal";
const AppointmentBookingPage = () => {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const doctorId = searchParams.get("doctorId") || "";
  const caretakerId = searchParams.get("caretakerId") || "";
  const providerId = searchParams.get("providerId") || "";
  const daycareProviderId =
    searchParams.get("providerId") || location.state?.caretaker?._id || "";
  const daycareProviderType = searchParams.get("providerType") || "caretaker";
  const service = searchParams.get("service") || "";
  const mode = searchParams.get("mode") || "";
  const queryPetName = searchParams.get("petName") || "";
  const queryPetType = searchParams.get("petType") || "";
  const queryPetId = searchParams.get("petId") || "";
  const petContext = location.state?.petContext || null;
  const initialPetName = petContext?.name || queryPetName;
  const initialPetType = petContext?.type || queryPetType;
  const enquiryPetId = petContext?.id || queryPetId;
  const fromPath = useMemo(
    () => location.state?.from || "/",
    [location.state?.from],
  );
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [isFlowConfirmed, setIsFlowConfirmed] = useState(false);
  useEffect(() => {
    setIsFlowConfirmed(false);
  }, [
    type,
    doctorId,
    caretakerId,
    providerId,
    daycareProviderId,
    daycareProviderType,
  ]);
  const navigateBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(fromPath);
      return;
    }
    navigate("/");
  }, [navigate, fromPath]);
  const goBack = ({ skipPrompt = false } = {}) => {
    if (skipPrompt) {
      if (isFlowConfirmed) {
        navigate("/profile?tab=appointments");
        return;
      }
      navigateBack();
      return;
    }

    setShowBackConfirm(true);
  };
  const renderFlow = () => {
    if (type === "vet") {
      if (!doctorId) {
        return <p className={styles.errorText}>Doctor not selected.</p>;
      }
      return (
        <BookAppointmentModal
          providerId={doctorId}
          providerType="doctor"
          initialService="vet"
          onClose={() =>
            goBack({
              skipPrompt: true,
            })
          }
          onStepChange={(step) => setIsFlowConfirmed(step === 4)}
          asPage
        />
      );
    }
    if (type === "caretaker") {
      if (!caretakerId) {
        return <p className={styles.errorText}>Caretaker not selected.</p>;
      }
      return (
        <ServiceBookingForm
          key={`caretaker-${caretakerId}`}
          defaultService={service || "daycare"}
          providerId={caretakerId}
          providerType="caretaker"
          enableMultipleDates
          onClose={() =>
            goBack({
              skipPrompt: true,
            })
          }
          onStepChange={(step) => setIsFlowConfirmed(step === 4)}
        />
      );
    }
    if (type === "daycare") {
      if (!daycareProviderId) {
        return (
          <p className={styles.errorText}>Daycare or caretaker not selected.</p>
        );
      }
      return (
        <ServiceBookingForm
          key={`daycare-${daycareProviderId}`}
          defaultService={service}
          providerId={daycareProviderId}
          providerType={daycareProviderType}
          enableMultipleDates
          onClose={() =>
            goBack({
              skipPrompt: true,
            })
          }
          onStepChange={(step) => setIsFlowConfirmed(step === 4)}
        />
      );
    }
    if (type === "shop") {
      if (!providerId) {
        return <p className={styles.errorText}>Shop not selected.</p>;
      }
      return (
        <BookAppointmentModal
          providerId={providerId}
          providerType="shop"
          initialService={service || "shop"}
          initialPetName={initialPetName}
          initialPetType={initialPetType}
          enquiryPetId={enquiryPetId}
          enquiryMode={mode === "enquiry"}
          onClose={() =>
            goBack({
              skipPrompt: true,
            })
          }
          onStepChange={(step) => setIsFlowConfirmed(step === 4)}
          asPage
        />
      );
    }
    if (type === "adoption") {
      if (!providerId) {
        return (
          <p className={styles.errorText}>Adoption provider not selected.</p>
        );
      }
      return (
        <BookAppointmentModal
          providerId={providerId}
          providerType="ngo"
          initialService={service || "pet_adoption"}
          initialPetName={initialPetName}
          initialPetType={initialPetType}
          enquiryPetId={enquiryPetId}
          enquiryMode
          onClose={() =>
            goBack({
              skipPrompt: true,
            })
          }
          onStepChange={(step) => setIsFlowConfirmed(step === 4)}
          asPage
        />
      );
    }
    return <p className={styles.errorText}>Invalid booking type.</p>;
  };
  const titleByType = {
    vet: "Book Vet Appointment",
    caretaker: "Book Caretaker",
    daycare: "Book Daycare Service",
    shop: "Book Shop Appointment",
    adoption: "Send Adoption Enquiry",
  };
  const subtitleByType = {
    vet: "Complete the steps below to request an appointment.",
    caretaker: "Select date, add pet details, and confirm your booking.",
    daycare: "Choose a service slot and submit your request.",
    shop: "Schedule your visit in a few quick steps.",
    adoption: "Complete steps below to submit your adoption enquiry.",
  };
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {!isFlowConfirmed && (
          <Button
            type="button"
            className={styles.backButton}
            onClick={() => goBack()}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft size={16} />
            Back
          </Button>
        )}

        <SectionHeader
          className={styles.header}
          level="page"
          align="center"
          title={titleByType[type] || "Appointment Booking"}
          subtitle={
            subtitleByType[type] || "Fill details and confirm your appointment."
          }
        />

        <section className={styles.flowSection}>{renderFlow()}</section>
      </div>
      {showBackConfirm && (
        <ConfirmationModal
          config={{
            title: "Leave This Page",
            message:
              "Filled booking data will be lost. Do you want to leave this page?",
            confirmText: "Leave Page",
            type: "cancel",
          }}
          onConfirm={() => {
            setShowBackConfirm(false);
            navigateBack();
          }}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}
    </main>
  );
};
export default AppointmentBookingPage;
