import { createBrowserRouter } from "react-router-dom";
import RootView from "../views/routing/RootView";
import LoginView from "../views/LoginView";
import HomeRedirectView from "../views/HomeRedirectView";
import AvailableView from "../views/AvailableView";
import ReservationsView from "../views/ReservationsView";
import DeliverView from "../views/DeliverView";
import UsersView from "../views/UsersView";
import RecordView from "../views/RecordView";
import ReserveView from "../views/ReserveView";
import MyReservationsView from "../views/MyReservationsView";
import MyProfileView from "../views/MyProfileView";
import Error404View from "../views/Error404View";
import PrivateRoute from "../components/PrivateRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootView />,
    children: [
      { path: "/", element: <HomeRedirectView /> },
      { path: "/login", element: <LoginView /> },
      {
        path: "/Available",
        element: (
          <PrivateRoute onlyAdmin>
            <AvailableView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Reservas",
        element: (
          <PrivateRoute onlyAdmin>
            <ReservationsView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Entregar",
        element: (
          <PrivateRoute onlyAdmin>
            <DeliverView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Usuarios",
        element: (
          <PrivateRoute onlyAdmin>
            <UsersView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Historial",
        element: (
          <PrivateRoute onlyAdmin>
            <RecordView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Reservar",
        element: (
          <PrivateRoute>
            <ReserveView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Mis reservas",
        element: (
          <PrivateRoute>
            <MyReservationsView />
          </PrivateRoute>
        ),
      },
      {
        path: "/Mi perfil",
        element: (
          <PrivateRoute>
            <MyProfileView />
          </PrivateRoute>
        ),
      },
      { path: "*", element: <Error404View /> },
    ],
  },
]);
