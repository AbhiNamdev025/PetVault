import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProfileSkeleton } from "../components/Skeletons";
import { redirectToAuthHome } from "../utils/authModalNavigation";

function ProtectedPath({ children, requiredRole }) {
  const [isAllowed, setIsAllowed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    const userData =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!token || !user) {
      redirectToAuthHome(navigate, "login", window.location.pathname);
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      navigate("/");
      return;
    }

    setIsAllowed(true);
  }, [navigate, requiredRole]);

  if (!isAllowed) return <ProfileSkeleton />;

  return children;
}

export default ProtectedPath;
