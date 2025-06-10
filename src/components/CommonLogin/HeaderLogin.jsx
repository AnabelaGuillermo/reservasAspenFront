import { Link, NavLink } from "react-router-dom";
import { useSession } from "../../stores/useSession";
import "../../css/Header.css";

const SimpleHeader = () => {
  const { isLoggedIn } = useSession();

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

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto text-center">
              {!isLoggedIn && (
                <li className="nav-item">
                  <NavLink className="nav-link ps-3 pe-3" to="/login">
                    Iniciar sesión
                  </NavLink>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default SimpleHeader;
