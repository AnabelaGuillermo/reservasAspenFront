import { Link, NavLink, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useSession } from "../../stores/useSession";
import "../../css/Header.css";



const Header = () => {
  const { user, isLoggedIn, logout } = useSession();
  const navRef = useRef();
  const navigate = useNavigate();

  // Redirigir al login si no está logueado
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const handleLogout = async () => {
    const action = await Swal.fire({
      icon: "question",
      title: "Atención",
      text: "¿Está seguro que desea cerrar sesión?",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "No, cancelar",
      showCancelButton: true,
      customClass: {
        confirmButton: "confirm-button-class",
        cancelButton: "cancel-button-class",
      },
    });

    if (action.isConfirmed) {
      logout();
    }
  };

  const isAdmin = user ? user.isAdmin : false;

  console.log("isLoggedIn:", isLoggedIn);
console.log("user:", user);

  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-da fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to={isAdmin ? "/admin" : "/Reservar"}>
            <img
              className="logoHeader"
              src="/Logo_Aspen.png"
              alt="Logo Aspen"
            />
          </Link>

          <button
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
            className="navbar-toggler"
            data-bs-target="#navbarNav"
            data-bs-toggle="collapse"
            type="button"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav" ref={navRef}>
            <ul className="navbar-nav ms-auto text-center">

              {/* Botón Login visible siempre */}
              {!isLoggedIn && (
                <li className="nav-item">
                  <NavLink className="nav-link ps-3 pe-3" to="/login">
                    Iniciar sesión
                  </NavLink>
                </li>
              )}

              {/* Rutas para Admin */}
              {isLoggedIn && isAdmin && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/admin">
                      Cargar disponible
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Reservas">
                      Reservas
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Entregar">
                      Entregar
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Usuarios">
                      Mi Perfil / Usuarios
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Historial">
                      Historial
                    </NavLink>
                  </li>
                </>
              )}

              {/* Rutas para Usuarios No Admin */}
              {isLoggedIn && !isAdmin && (
                <>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Reservar">
                      Reservar
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Mis reservas">
                      Mis reservas
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink className="nav-link ps-3 pe-3" to="/Mi perfil">
                      Mi perfil
                    </NavLink>
                  </li>
                </>
              )}

              {/* Botón Logout visible solo si hay sesión */}
              {isLoggedIn && (
                <li className="nav-item">
                  <button
                    className="btn button-logout"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
