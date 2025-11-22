// import React, { useState } from "react";
// import styles from "./appointmentModal.module.css";
// import {
//   X,
//   CheckCircle,
//   XCircle,
//   Camera,
//   PawPrint,
//   AlertTriangle,
//   Loader2,
// } from "lucide-react";

// const AppointmentModal = ({
//   appointment,
//   isServiceProvider,
//   onClose,
//   onStatusChange,
// }) => {
//   const [updatingStatus, setUpdatingStatus] = useState(null);
//   const [currentAppointment, setCurrentAppointment] = useState(appointment);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "confirmed":
//         return styles.statusConfirmed;
//       case "pending":
//         return styles.statusPending;
//       case "completed":
//         return styles.statusCompleted;
//       case "cancelled":
//         return styles.statusCancelled;
//       default:
//         return styles.statusPending;
//     }
//   };

//   const formatDateTime = (dateString) => {
//     const date = new Date(dateString);
//     return {
//       date: date.toLocaleDateString("en-IN"),
//       time: date.toLocaleTimeString("en-IN", {
//         hour: "2-digit",
//         minute: "2-digit",
//       }),
//     };
//   };

//   const { date, time } = formatDateTime(
//     currentAppointment.date || currentAppointment.createdAt
//   );

//   const isRescueRequest =
//     currentAppointment.providerType === "NGO" ||
//     currentAppointment.service === "others";

//   const handleStatusUpdate = async (newStatus) => {
//     setUpdatingStatus(newStatus);

//     // Update local state immediately
//     setCurrentAppointment((prev) => ({
//       ...prev,
//       status: newStatus,
//     }));

//     try {
//       await onStatusChange(currentAppointment, newStatus);
//     } catch (error) {
//       // Revert if failed
//       setCurrentAppointment((prev) => ({
//         ...prev,
//         status: appointment.status,
//       }));
//     } finally {
//       setUpdatingStatus(null);
//     }
//   };

//   const shouldShowConfirmButton =
//     currentAppointment.status === "pending" && !updatingStatus;
//   const shouldShowCompleteButton =
//     (currentAppointment.status === "pending" ||
//       currentAppointment.status === "confirmed") &&
//     !updatingStatus;
//   const shouldShowCancelButton =
//     (currentAppointment.status === "pending" ||
//       currentAppointment.status === "confirmed") &&
//     !updatingStatus;

//   return (
//     <div className={styles.modalOverlay}>
//       <div className={styles.modal}>
//         <div className={styles.modalHeader}>
//           <h3>
//             {isRescueRequest ? (
//               <>
//                 <AlertTriangle size={24} />
//                 Rescue Request Details
//               </>
//             ) : (
//               "Appointment Details"
//             )}
//           </h3>
//           <button className={styles.closeButton} onClick={onClose}>
//             <X size={20} />
//           </button>
//         </div>

//         <div className={styles.modalContent}>
//           <div className={styles.detailSection}>
//             <h4>Service Information</h4>
//             <p>
//               <strong>Service:</strong>{" "}
//               {isRescueRequest
//                 ? "Pet Rescue Request"
//                 : currentAppointment.service || currentAppointment.providerType}
//             </p>
//             <p>
//               <strong>Status:</strong>
//               <span
//                 className={`${styles.status} ${getStatusColor(
//                   currentAppointment.status
//                 )}`}
//               >
//                 {updatingStatus ? (
//                   <>
//                     <Loader2 size={12} className={styles.spinner} />
//                     Updating...
//                   </>
//                 ) : (
//                   currentAppointment.status
//                 )}
//               </span>
//             </p>
//           </div>

//           {isRescueRequest && (
//             <div className={styles.detailSection}>
//               <h4>
//                 <PawPrint size={20} />
//                 Pet Information
//               </h4>
//               <p>
//                 <strong>Pet Name:</strong>{" "}
//                 {currentAppointment.petName || "Unknown"}
//               </p>
//               <p>
//                 <strong>Pet Type:</strong> {currentAppointment.petType}
//               </p>
//               {currentAppointment.healthIssues && (
//                 <p>
//                   <strong>Health Issues:</strong>{" "}
//                   {currentAppointment.healthIssues}
//                 </p>
//               )}
//             </div>
//           )}

//           <div className={styles.detailSection}>
//             <h4>Time Information</h4>
//             <p>
//               <strong>Date:</strong> {date}
//             </p>
//             <p>
//               <strong>Time:</strong> {currentAppointment.time || time}
//             </p>
//           </div>

//           {currentAppointment.reason && (
//             <div className={styles.detailSection}>
//               <h4>
//                 {isRescueRequest ? "Situation Details" : "Appointment Details"}
//               </h4>
//               <p>
//                 <strong>{isRescueRequest ? "Situation" : "Reason"}:</strong>{" "}
//                 {currentAppointment.reason}
//               </p>
//               {currentAppointment.healthIssues && !isRescueRequest && (
//                 <p>
//                   <strong>Health Notes:</strong>{" "}
//                   {currentAppointment.healthIssues}
//                 </p>
//               )}
//             </div>
//           )}

//           {isRescueRequest &&
//             currentAppointment.petImages &&
//             currentAppointment.petImages.length > 0 && (
//               <div className={styles.detailSection}>
//                 <h4>
//                   <Camera size={20} />
//                   Pet Photos ({currentAppointment.petImages.length})
//                 </h4>
//                 <div className={styles.imageGrid}>
//                   {currentAppointment.petImages.map((image, index) => (
//                     <div key={index} className={styles.imageItem}>
//                       <img
//                         src={`http://localhost:5000/uploads/pets/${image}`}
//                         alt={`Pet ${index + 1}`}
//                         onError={(e) => {
//                           e.target.style.display = "none";
//                           e.target.nextSibling.style.display = "flex";
//                         }}
//                       />
//                       <div className={styles.imageFallback}>
//                         <Camera size={24} />
//                         <span>Image {index + 1}</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//           <div className={styles.detailSection}>
//             <h4>Contact Information</h4>
//             {isServiceProvider ? (
//               <>
//                 <p>
//                   <strong>Reporter:</strong>{" "}
//                   {currentAppointment.user?.name || "—"}
//                 </p>
//                 {currentAppointment.user?.phone && (
//                   <p>
//                     <strong>Phone:</strong> {currentAppointment.user.phone}
//                   </p>
//                 )}
//                 {currentAppointment.user?.email && (
//                   <p>
//                     <strong>Email:</strong> {currentAppointment.user.email}
//                   </p>
//                 )}
//               </>
//             ) : (
//               <>
//                 <p>
//                   <strong>NGO:</strong>{" "}
//                   {currentAppointment.providerId?.name || "—"}
//                 </p>
//                 {currentAppointment.providerPhone && (
//                   <p>
//                     <strong>Phone:</strong> {currentAppointment.providerPhone}
//                   </p>
//                 )}
//                 {currentAppointment.providerEmail && (
//                   <p>
//                     <strong>Email:</strong> {currentAppointment.providerEmail}
//                   </p>
//                 )}
//               </>
//             )}
//           </div>
//         </div>

//         <div className={styles.modalActions}>
//           <button className={styles.secondaryButton} onClick={onClose}>
//             Close
//           </button>

//           {isServiceProvider ? (
//             <>
//               {shouldShowConfirmButton && (
//                 <button
//                   className={styles.confirmButton}
//                   onClick={() => handleStatusUpdate("confirmed")}
//                 >
//                   <CheckCircle size={16} />
//                   Confirm
//                 </button>
//               )}

//               {shouldShowCompleteButton && (
//                 <button
//                   className={styles.completeButton}
//                   onClick={() => handleStatusUpdate("completed")}
//                 >
//                   <CheckCircle size={16} />
//                   Complete
//                 </button>
//               )}

//               {shouldShowCancelButton && (
//                 <button
//                   className={styles.dangerButton}
//                   onClick={() => handleStatusUpdate("cancelled")}
//                 >
//                   <XCircle size={16} />
//                   Cancel
//                 </button>
//               )}

//               {updatingStatus && (
//                 <div className={styles.updatingStatus}>
//                   <Loader2 size={16} className={styles.spinner} />
//                   Updating...
//                 </div>
//               )}
//             </>
//           ) : (
//             <>
//               {shouldShowCancelButton && (
//                 <button
//                   className={styles.dangerButton}
//                   onClick={() => handleStatusUpdate("cancelled")}
//                 >
//                   <XCircle size={16} />
//                   Cancel
//                 </button>
//               )}

//               {updatingStatus && (
//                 <div className={styles.updatingStatus}>
//                   <Loader2 size={16} className={styles.spinner} />
//                   Updating...
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AppointmentModal;

import React, { useState } from "react";
import styles from "./appointmentModal.module.css";
import {
  X,
  CheckCircle,
  XCircle,
  Camera,
  PawPrint,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const AppointmentModal = ({
  appointment,
  isServiceProvider,
  onClose,
  onStatusChange,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [currentAppointment, setCurrentAppointment] = useState(appointment);

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return styles.statusConfirmed;
      case "pending":
        return styles.statusPending;
      case "completed":
        return styles.statusCompleted;
      case "cancelled":
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-IN"),
      time: date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const { date, time } = formatDateTime(
    currentAppointment.date || currentAppointment.createdAt
  );

  const isRescueRequest =
    currentAppointment.providerType === "NGO" ||
    currentAppointment.service === "others";

  const isShopAppointment = currentAppointment.providerType === "shop";

  const handleStatusUpdate = async (newStatus) => {
    setUpdatingStatus(newStatus);

    setCurrentAppointment((prev) => ({
      ...prev,
      status: newStatus,
    }));

    try {
      await onStatusChange(currentAppointment, newStatus);
    } catch (error) {
      setCurrentAppointment((prev) => ({
        ...prev,
        status: appointment.status,
      }));
    } finally {
      setUpdatingStatus(null);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>
            {isRescueRequest
              ? "Rescue Request Details"
              : isShopAppointment
              ? "Shop Appointment Details"
              : "Appointment Details"}
          </h3>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          <div className={styles.detailSection}>
            <h4>Service Information</h4>
            <p>
              <strong>Service:</strong>{" "}
              {isRescueRequest
                ? "Pet Rescue Request"
                : isShopAppointment
                ? "Shop Appointment"
                : currentAppointment.service}
            </p>
            <p>
              <strong>Status:</strong>
              <span
                className={`${styles.status} ${getStatusColor(
                  currentAppointment.status
                )}`}
              >
                {currentAppointment.status}
              </span>
            </p>
          </div>

          {isShopAppointment && (
            <div className={styles.detailSection}>
              <h4>
                <PawPrint size={20} /> Pet Information
              </h4>
              <p>
                <strong>Pet Name:</strong> {currentAppointment.petName}
              </p>
              <p>
                <strong>Pet Type:</strong> {currentAppointment.petType}
              </p>
            </div>
          )}

          {isRescueRequest && (
            <div className={styles.detailSection}>
              <h4>
                <PawPrint size={20} /> Pet Details
              </h4>
              <p>
                <strong>Pet Name:</strong> {currentAppointment.petName}
              </p>
              <p>
                <strong>Pet Type:</strong> {currentAppointment.petType}
              </p>
              {currentAppointment.healthIssues && (
                <p>
                  <strong>Health Issues:</strong>{" "}
                  {currentAppointment.healthIssues}
                </p>
              )}
            </div>
          )}

          <div className={styles.detailSection}>
            <h4>Time Information</h4>
            <p>
              <strong>Date:</strong> {date}
            </p>
            <p>
              <strong>Time:</strong> {currentAppointment.time || time}
            </p>
          </div>

          {currentAppointment.reason && (
            <div className={styles.detailSection}>
              <h4>{isRescueRequest ? "Situation" : "Reason"}</h4>
              <p>{currentAppointment.reason}</p>
            </div>
          )}

          <div className={styles.detailSection}>
            <h4>Contact Information</h4>

            {isServiceProvider ? (
              isShopAppointment ? (
                <>
                  <p>
                    <strong>Customer:</strong> {currentAppointment.user?.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {currentAppointment.user?.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {currentAppointment.user?.email}
                  </p>
                </>
              ) : isRescueRequest ? (
                <>
                  <p>
                    <strong>Reporter:</strong> {currentAppointment.user?.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {currentAppointment.user?.phone}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Client:</strong> {currentAppointment.user?.name}
                  </p>
                </>
              )
            ) : (
              <>
                <p>
                  <strong>Provider:</strong>{" "}
                  {currentAppointment.providerId?.name}
                </p>
              </>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>

          {isServiceProvider && (
            <>
              {currentAppointment.status === "pending" && (
                <button
                  className={styles.confirmButton}
                  onClick={() => handleStatusUpdate("confirmed")}
                >
                  <CheckCircle size={16} /> Confirm
                </button>
              )}

              {(currentAppointment.status === "pending" ||
                currentAppointment.status === "confirmed") && (
                <button
                  className={styles.completeButton}
                  onClick={() => handleStatusUpdate("completed")}
                >
                  <CheckCircle size={16} /> Complete
                </button>
              )}

              {(currentAppointment.status === "pending" ||
                currentAppointment.status === "confirmed") && (
                <button
                  className={styles.dangerButton}
                  onClick={() => handleStatusUpdate("cancelled")}
                >
                  <XCircle size={16} /> Cancel
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
