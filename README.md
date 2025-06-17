# Reservas Aspen Frontend

Este es el **frontend** del sistema de reservas de motocicletas desarrollado para **Aspen Motos**. Permite a administradores y vendedores gestionar productos (motos), usuarios y reservas desde una interfaz web intuitiva.

## Funcionalidades principales

### Usuarios
- Registro e inicio de sesión.
- Roles: **Administrador** y **Vendedor**.
- Los administradores pueden:
  - Añadir, editar y eliminar usuarios.
  - Ver historial de acciones.

### Motos
- Alta, edición y eliminación de motocicletas.
- Visualización de motos disponibles.

### Reservas
- Crear reservas manualmente.
- Editar y eliminar reservas.
- Entregar motos reservadas.
- Ver historial de reservas.

---

## Tecnologías utilizadas

- **React** + **Vite**: Desarrollo rápido con React moderno.
- **React Router DOM**: Navegación y rutas protegidas.
- **Zustand**: Manejo de estado global.
- **React Hook Form**: Formularios eficientes y validados.
- **React Query** (`@tanstack/react-query`): Manejo de peticiones y caché.
- **SweetAlert2** y **Sonner**: Notificaciones y alertas interactivas.
- **Bootstrap**: Estilos y componentes rápidos.
- **jwt-decode**: Decodificación de tokens JWT.

---

## Cómo ejecutar el proyecto

### Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/reservasaspenfront.git
cd reservasaspenfront
```

### Instalar dependencias
```bash
npm install
```

### Crea el archivo .env:
Copia el archivo .env.sample a .env y configura tus variables de entorno.

### Ejecutar en modo desarrollo
```bash
npm run dev
```

La aplicación estará disponible por defecto en: http://localhost:5173/

Este proyecto fue desarrollado para Aspen Motos como parte de su sistema de gestión de reservas.
Puedes contactarme por mail escribiendo a la casilla: anabela.guillermo@gmail.com