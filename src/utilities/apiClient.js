import { useSession } from '../stores/useSession';

const originalFetch = window.fetch;

export const setupGlobalFetchInterceptor = (timeout = 10000) => {
  window.fetch = async (...args) => {
    let [resource, config] = args;
    const token = localStorage.getItem('token');
    const headers = new Headers(config?.headers || {});

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    config = { ...config, headers, signal: controller.signal };

    try {
      const response = await originalFetch(resource, config);
      clearTimeout(id);

      if (!response.ok) {
        const clonedResponse = response.clone();
        const errorData = await clonedResponse.json().catch(() => ({ message: 'Error desconocido', error: 'No se pudo parsear JSON' }));

        if (response.status === 401 || response.status === 403) {
          console.error(`Global Fetch Interceptor: Error ${response.status}. Sesión expirada o no autorizada.`);
          const { logout } = useSession.getState();
          logout();

          if (window.location.pathname !== "/") {
            window.location.href = "/";
          }
          window.location.reload();
        }

        const error = new Error(errorData.message || `Error HTTP: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return response;

    } catch (error) {
      clearTimeout(id);

      if (error.name === 'AbortError') {
        console.error("Global Fetch Interceptor: La petición excedió el tiempo límite (timeout).", error);
        const { logout } = useSession.getState();
        logout();
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        window.location.reload();
        throw new Error('Petición cancelada por timeout.');
      } else {
        console.error("Global Fetch Interceptor: Error de red o en la petición:", error);
      }
      throw error;
    }
  };
};
