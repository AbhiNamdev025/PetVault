import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
      navigate("/login");
      return;
    }

    if (requiredRole && user.role !== requiredRole) {
      navigate("/");
      return;
    }

    setIsAllowed(true);
  }, [navigate, requiredRole]);

  if (!isAllowed) return <div>Loading...</div>;

  return children;
}

export default ProtectedPath;
