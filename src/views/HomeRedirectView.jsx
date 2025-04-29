import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../stores/useSession";

const HomeRedirectView = () => {
  const { isLoggedIn, user } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    } else if (user?.isAdmin) {
      navigate("/Available");
    } else {
      navigate("/Reservar");
    }
  }, [isLoggedIn, user, navigate]);

  return null;
};

export default HomeRedirectView;
