import { Link, NavLink, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useSession } from "../../stores/useSession";
import "../../css/Header.css";

const Header = () => {
  const { user, isLoggedIn, logout } = useSession();
  const navRef = useRef();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const action = await Swal.fire({
      icon: "question",
      title: "Atención",
      text: "¿Está seguro que desea cerrar sesión?",
      confirmButtonText: "Sí, salir",
      cancelButtonText: "No, cancelar",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    });

    if (action.isConfirmed) {
      logout();
      navigate("/login");
    }
  };

  const closeNavbar = () => {
    const navbarToggler = document.querySelector(".navbar-toggler");
    const navbarCollapse = document.querySelector("#navbarNav");

    if (navbarToggler && navbarCollapse.classList.contains("show")) {
      navbarToggler.click();
    }
  };

  const isAdmin = user ? user.isAdmin : false;

  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-da fixed-top">
        <div className="container-fluid">
          <Link
            className="navbar-brand"
            to={isLoggedIn ? (isAdmin ? "/Available" : "/Reservar") : "/"}
            onClick={closeNavbar}
          >
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
              {!isLoggedIn && (
                <li className="nav-item">
                  <NavLink
                    className="nav-link ps-3 pe-3"
                    to="/login"
                    onClick={closeNavbar}
                  >
                    Iniciar sesión
                  </NavLink>
                </li>
              )}

              {isLoggedIn && isAdmin && (
                <>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Available"
                      onClick={closeNavbar}
                    >
                      Cargar disponible
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Reservas"
                      onClick={closeNavbar}
                    >
                      Reservas
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Entregar"
                      onClick={closeNavbar}
                    >
                      Entregar
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Usuarios"
                      onClick={closeNavbar}
                    >
                      Usuarios
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Historial"
                      onClick={closeNavbar}
                    >
                      Historial
                    </NavLink>
                  </li>
                </>
              )}

              {isLoggedIn && !isAdmin && (
                <>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Reservar"
                      onClick={closeNavbar}
                    >
                      Reservar
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Mis reservas"
                      onClick={closeNavbar}
                    >
                      Mis reservas
                    </NavLink>
                  </li>
                  <li className="nav-item">
                    <NavLink
                      className="nav-link ps-3 pe-3"
                      to="/Mi perfil"
                      onClick={closeNavbar}
                    >
                      Mi perfil
                    </NavLink>
                  </li>
                </>
              )}

              {isLoggedIn && (
                <li className="nav-item">
                  <button className="btn button-logout" onClick={handleLogout}>
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
