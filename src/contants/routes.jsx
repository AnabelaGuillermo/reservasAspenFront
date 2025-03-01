import { createBrowserRouter } from "react-router-dom";
import RootView from "../views/routing/RootView";
import HomeView from "../views/HomeView";
import Error404View from "../views/Error404View";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootView />,
        children: [
            {
                path: "/",
                element: <HomeView />,
            },
            {
                path: "*",
                element: <Error404View />,
            },
        ],
    },
]);
