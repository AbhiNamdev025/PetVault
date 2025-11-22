

// import React, { useState } from "react";
// import styles from "./appointmentCard.module.css";
// import {
//   Calendar,
//   Clock,
//   MapPin,
//   User,
//   Phone,
//   MessageCircle,
//   CheckCircle,
//   X,
//   Loader2,
//   Camera,
//   AlertTriangle,
//   PawPrint,
// } from "lucide-react";

// const AppointmentCard = ({ appointment, userRole, isServiceProvider, onViewDetails, onStatusChange }) => {
//   const [updatingStatus, setUpdatingStatus] = useState(null);

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
//       time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
//     };
//   };

//   const { date, time } = formatDateTime(appointment.date || appointment.createdAt);
//   const isRescueRequest = appointment.providerType === "NGO" || appointment.service === "others";

//   return (
//     <div className={styles.appointmentCard}>
//       <div className={styles.appointmentHeader}>
//         <div className={styles.serviceInfo}>
//           <h4 className={styles.serviceName}>
//             {isRescueRequest ? (
//               <>
//                 <AlertTriangle size={20} />
//                 Rescue Request
//               </>
//             ) : (
//               appointment.service || appointment.providerType
//             )}
//           </h4>
//           <span className={`${styles.status} ${getStatusColor(appointment.status)}`}>
//             {appointment.status}
//           </span>
//         </div>
//         <div className={styles.appointmentDateTime}>
//           <div className={styles.dateTime}>
//             <Calendar size={16} />
//             <span>{date}</span>
//           </div>
//           <div className={styles.dateTime}>
//             <Clock size={16} />
//             <span>{appointment.time || time}</span>
//           </div>
//         </div>
//       </div>

//       {isRescueRequest && (
//         <div className={styles.rescueBadge}>
//           <AlertTriangle size={16} />
//           <span>Abandoned Pet Rescue Request</span>
//         </div>
//       )}

//       <div className={styles.appointmentDetails}>
//         {isServiceProvider ? (
//           <>
//             <div className={styles.detailRow}>
//               <User size={16} />
//               <span>Reporter: {appointment.user?.name || "—"}</span>
//             </div>
//             {appointment.user?.phone && (
//               <div className={styles.detailRow}>
//                 <Phone size={16} />
//                 <span>{appointment.user.phone}</span>
//               </div>
//             )}
//           </>
//         ) : (
//           <>
//             <div className={styles.detailRow}>
//               <User size={16} />
//               <span>NGO: {appointment.providerId?.name || appointment.providerName || "—"}</span>
//             </div>
//             {appointment.providerPhone && (
//               <div className={styles.detailRow}>
//                 <Phone size={16} />
//                 <span>{appointment.providerPhone}</span>
//               </div>
//             )}
//           </>
//         )}

//         {isRescueRequest && (
//           <>
//             <div className={styles.detailRow}>
//               <PawPrint size={16} />
//               <span>Pet: {appointment.petName} ({appointment.petType})</span>
//             </div>
//             {appointment.healthIssues && (
//               <div className={styles.detailRow}>
//                 <MessageCircle size={16} />
//                 <span>Health Issues: {appointment.healthIssues}</span>
//               </div>
//             )}
//           </>
//         )}

//         {appointment.reason && (
//           <div className={styles.detailRow}>
//             <MessageCircle size={16} />
//             <span>{isRescueRequest ? "Situation Details" : "Reason"}: {appointment.reason}</span>
//           </div>
//         )}

//         {isRescueRequest && appointment.petImages && appointment.petImages.length > 0 && (
//           <div className={styles.detailRow}>
//             <Camera size={16} />
//             <span>Pet Photos: {appointment.petImages.length} image(s)</span>
//           </div>
//         )}
//       </div>

//       <div className={styles.appointmentActions}>
//         <button
//           className={styles.secondaryButton}
//           onClick={onViewDetails}
//         >
//           {isRescueRequest ? "View Rescue Details" : "View Details"}
//         </button>

//         {isServiceProvider ? (
//           <>
//             {appointment.status === "pending" && (
//               <button
//                 className={styles.confirmButton}
//                 onClick={() => onStatusChange(appointment, "confirmed")}
//                 disabled={updatingStatus === appointment._id}
//               >
//                 {updatingStatus === appointment._id ? (
//                   <Loader2 size={16} className={styles.spinner} />
//                 ) : (
//                   <CheckCircle size={16} />
//                 )}
//                 Confirm
//               </button>
//             )}
            
//             {(appointment.status === "pending" || appointment.status === "confirmed") && (
//               <button
//                 className={styles.completeButton}
//                 onClick={() => onStatusChange(appointment, "completed")}
//                 disabled={updatingStatus === appointment._id}
//               >
//                 {updatingStatus === appointment._id ? (
//                   <Loader2 size={16} className={styles.spinner} />
//                 ) : (
//                   <CheckCircle size={16} />
//                 )}
//                 Complete
//               </button>
//             )}

//             {(appointment.status === "pending" || appointment.status === "confirmed") && (
//               <button
//                 className={styles.dangerButton}
//                 onClick={() => onStatusChange(appointment, "cancelled")}
//                 disabled={updatingStatus === appointment._id}
//               >
//                 {updatingStatus === appointment._id ? (
//                   <Loader2 size={16} className={styles.spinner} />
//                 ) : (
//                   <X size={16} />
//                 )}
//                 Cancel
//               </button>
//             )}
//           </>
//         ) : (
//           <>
//             {(appointment.status === "pending" || appointment.status === "confirmed") && (
//               <button
//                 className={styles.dangerButton}
//                 onClick={() => onStatusChange(appointment, "cancelled")}
//                 disabled={updatingStatus === appointment._id}
//               >
//                 {updatingStatus === appointment._id ? (
//                   <Loader2 size={16} className={styles.spinner} />
//                 ) : (
//                   <X size={16} />
//                 )}
//                 Cancel
//               </button>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppointmentCard;






import React, { useState } from "react";
import styles from "./appointmentCard.module.css";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  CheckCircle,
  X,
  Loader2,
  Camera,
  AlertTriangle,
  PawPrint,
} from "lucide-react";

const AppointmentCard = ({
  appointment,
  userRole,
  isServiceProvider,
  onViewDetails,
  onStatusChange,
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(null);

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
    appointment.date || appointment.createdAt
  );

  const isRescueRequest =
    appointment.providerType === "NGO" || appointment.service === "others";

  const isShopAppointment = appointment.providerType === "shop";

  return (
    <div className={styles.appointmentCard}>
      <div className={styles.appointmentHeader}>
        <div className={styles.serviceInfo}>
          <h4 className={styles.serviceName}>
            {isRescueRequest ? (
              <>
                <AlertTriangle size={20} />
                Rescue Request
              </>
            ) : isShopAppointment ? (
              <>🛒 Shop Appointment</>
            ) : (
              appointment.service || appointment.providerType
            )}
          </h4>

          <span
            className={`${styles.status} ${getStatusColor(
              appointment.status
            )}`}
          >
            {appointment.status}
          </span>
        </div>

        <div className={styles.appointmentDateTime}>
          <div className={styles.dateTime}>
            <Calendar size={16} />
            <span>{date}</span>
          </div>
          <div className={styles.dateTime}>
            <Clock size={16} />
            <span>{appointment.time || time}</span>
          </div>
        </div>
      </div>

      {isRescueRequest && (
        <div className={styles.rescueBadge}>
          <AlertTriangle size={16} />
          <span>Abandoned Pet Rescue Request</span>
        </div>
      )}

      <div className={styles.appointmentDetails}>
        {isServiceProvider ? (
          <>
            {isShopAppointment ? (
              <>
                <div className={styles.detailRow}>
                  <User size={16} />
                  <span>Customer: {appointment.user?.name || "—"}</span>
                </div>

                {appointment.user?.phone && (
                  <div className={styles.detailRow}>
                    <Phone size={16} />
                    <span>{appointment.user.phone}</span>
                  </div>
                )}
              </>
            ) : isRescueRequest ? (
              <>
                <div className={styles.detailRow}>
                  <User size={16} />
                  <span>Reporter: {appointment.user?.name || "—"}</span>
                </div>
              </>
            ) : (
              <>
                <div className={styles.detailRow}>
                  <User size={16} />
                  <span>Client: {appointment.user?.name || "—"}</span>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className={styles.detailRow}>
              <User size={16} />
              <span>Provider: {appointment.providerId?.name || "—"}</span>
            </div>
          </>
        )}

        {isShopAppointment && (
          <>
            <div className={styles.detailRow}>
              <PawPrint size={16} />
              <span>
                Pet: {appointment.petName} ({appointment.petType})
              </span>
            </div>
          </>
        )}

        {isRescueRequest && (
          <>
            <div className={styles.detailRow}>
              <PawPrint size={16} />
              <span>
                Pet: {appointment.petName} ({appointment.petType})
              </span>
            </div>
            {appointment.healthIssues && (
              <div className={styles.detailRow}>
                <MessageCircle size={16} />
                <span>Health Issues: {appointment.healthIssues}</span>
              </div>
            )}
          </>
        )}

        {appointment.reason && (
          <div className={styles.detailRow}>
            <MessageCircle size={16} />
            <span>
              {isRescueRequest ? "Situation" : "Reason"}:{" "}
              {appointment.reason}
            </span>
          </div>
        )}

        {isRescueRequest && appointment.petImages?.length > 0 && (
          <div className={styles.detailRow}>
            <Camera size={16} />
            <span>Pet Photos: {appointment.petImages.length}</span>
          </div>
        )}
      </div>

      <div className={styles.appointmentActions}>
        <button className={styles.secondaryButton} onClick={onViewDetails}>
          {isRescueRequest ? "View Rescue Details" : "View Details"}
        </button>

        {isServiceProvider && (
          <>
            {appointment.status === "pending" && (
              <button
                className={styles.confirmButton}
                onClick={() => onStatusChange(appointment, "confirmed")}
              >
                <CheckCircle size={16} />
                Confirm
              </button>
            )}

            {(appointment.status === "pending" ||
              appointment.status === "confirmed") && (
              <button
                className={styles.completeButton}
                onClick={() => onStatusChange(appointment, "completed")}
              >
                <CheckCircle size={16} />
                Complete
              </button>
            )}

            {(appointment.status === "pending" ||
              appointment.status === "confirmed") && (
              <button
                className={styles.dangerButton}
                onClick={() => onStatusChange(appointment, "cancelled")}
              >
                <X size={16} />
                Cancel
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentCard;
