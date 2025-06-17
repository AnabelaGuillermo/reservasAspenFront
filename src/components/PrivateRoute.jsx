import { Navigate } from "react-router-dom";
import { useSession } from "../stores/useSession";

const PrivateRoute = ({ children, onlyAdmin = false }) => {
  const { isLoggedIn, user } = useSession();

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (onlyAdmin && !user?.isAdmin) return <Navigate to="/Reservar" replace />;
  if (!onlyAdmin && user?.isAdmin) return <Navigate to="/Available" replace />;

  return children;
};

export default PrivateRoute;
