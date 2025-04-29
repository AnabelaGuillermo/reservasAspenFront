import { createBrowserRouter } from "react-router-dom";
import RootView from "../views/routing/RootView";
import LoginView from "../views/LoginView";
import AvailableView from "../views/AvailableView";
import ReservationsView from "../views/ReservationsView";
import DeliverView from "../views/DeliverView";
import UsersView from "../views/UsersView";
import RecordView from "../views/RecordView";
import ReserveView from "../views/ReserveView";
import MyReservationsView from "../views/MyReservationsView";
import MyProfileView from "../views/MyProfileView";
import Error404View from "../views/Error404View";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootView />,
    children: [
      {
        path: "/login",
        element: <LoginView />,
      },
      {
        path: "/Available",
        element: <AvailableView />,
      },
      {
        path: "/Reservas",
        element: <ReservationsView />,
      },
      {
        path: "/Entregar",
        element: <DeliverView />,
      },
      {
        path: "/Usuarios",
        element: <UsersView />,
      },
      {
        path: "/Historial",
        element: <RecordView />,
      },
      {
        path: "/Reservar",
        element: <ReserveView />,
      },
      {
        path: "/Mis reservas",
        element: <MyReservationsView />,
      },
      {
        path: "/Mi perfil",
        element: <MyProfileView />,
      },
      {
        path: "*",
        element: <Error404View />,
      },
    ],
  },
]);