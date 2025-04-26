import { Link, NavLink } from "react-router-dom";
import { useRef } from "react";

import "../../css/Header.css";

const Header = () => {
  const navRef = useRef(null);

  const handleNavLinkClick = () => {
    if (navRef.current.classList.contains("show")) {
      navRef.current.classList.remove("show");
    }
  };

  return (
    <header>
      <nav className="navbar navbar-expand-lg bg-da fixed-top">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
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
              <li className="nav-item">
                <NavLink
                  className="nav-link ps-3 pe-3"
                  to="/login"
                  onClick={handleNavLinkClick}
                >
                  Iniciar sesión
                </NavLink>
              </li>
              {[
                "/",
                "/Reservas",
                "/Entregar",
                "/Mi perfil / Usuarios",
                "/Historial",
                "/Reservar",
                "/Mis reservas",
                "/Mi perfil",
              ].map((path, index) => (
                <li className="nav-item" key={index}>
                  <NavLink
                    className={({ isActive }) =>
                      isActive
                        ? "nav-link active ps-3 pe-3"
                        : "nav-link ps-3 pe-3"
                    }
                    to={path}
                    onClick={handleNavLinkClick}
                  >
                    {path === "/" ? "Cargar disponible" : path.slice(1)}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item">
                <button className="btn button-logout">
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
