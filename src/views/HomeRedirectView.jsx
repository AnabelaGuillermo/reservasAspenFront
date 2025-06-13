import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSession } from "../stores/useSession";

const HomeRedirectView = () => {
  const { isLoggedIn, user } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === "/") {
      if (!isLoggedIn) {
        navigate("/login");
      } else if (user?.isAdmin) {
        navigate("/Available");
      } else {
        navigate("/Reservar");
      }
    }
  }, [isLoggedIn, user, navigate, location.pathname]);

  return null;
};

export default HomeRedirectView;
