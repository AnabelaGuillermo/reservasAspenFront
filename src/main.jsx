import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { setupGlobalFetchInterceptor } from "./utilities/apiClient";
import { useSession } from "./stores/useSession";

import { router } from "./constants/routes";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import "./index.css";

setupGlobalFetchInterceptor();

const queryClient = new QueryClient();

const AppInitializer = () => {
  const [isAppReady, setIsAppReady] = useState(false);
  const initializeSession = useSession.getState().initializeSession;

  useEffect(() => {
    initializeSession();
    setIsAppReady(true);
  }, [initializeSession]);

  if (!isAppReady) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', backgroundColor: '#f0f2f5' }}>
        Cargando aplicación...
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppInitializer />
  </React.StrictMode>
);