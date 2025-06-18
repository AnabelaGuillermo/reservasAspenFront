import { useSession } from '../stores/useSession';
import { router } from '../constants/routes';

const originalFetch = window.fetch;

export const setupGlobalFetchInterceptor = () => {
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const token = localStorage.getItem('token');
    const headers = new Headers(config?.headers || {});
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    config = { ...config, headers };

    try {
      const response = await originalFetch(resource, config);

      if (!response.ok) {
        const clonedResponse = response.clone();
        const errorData = await clonedResponse.json().catch(() => ({ message: 'Error desconocido', error: 'No se pudo parsear JSON' }));

        if (response.status === 401 || response.status === 403) {
          console.error(`Global Fetch Interceptor: Error ${response.status}. Sesión expirada o no autorizada.`);
          const { logout } = useSession.getState();
          logout();
          if (window.location.pathname !== "/login") {
             window.location.href = "/login";
          }
        }

        const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
        error.status = response.status;
        throw error;

      }
      return response;

    } catch (error) {
      console.error("Global Fetch Interceptor: Error de red o en la petición:", error);
      throw error;
    }
  };
};