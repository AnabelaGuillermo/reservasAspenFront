import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { useSession } from "../stores/useSession";
import SimpleHeader from "../components/CommonLogin/HeaderLogin";
import Footer from "../components/Common/Footer";

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload).user;
  } catch (error) {
    console.error("Error al decodificar el JWT:", error);
    return null;
  }
};

const LoginView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { login } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (response.ok) {
        const token = result.accessToken;
        const decodedUser = decodeJwtPayload(token);

        if (!token) {
          console.error("Token no recibido del servidor.");
          alert("Error al iniciar sesión: token no recibido.");
          return;
        }

        if (decodedUser) {
          login(decodedUser, token);

          if (decodedUser?.isAdmin) {
            navigate("/Available");
          } else {
            navigate("/Reservar");
          }
        } else {
          console.error(
            "Error: No se pudo decodificar la información del usuario del JWT."
          );
          alert(
            "Error al iniciar sesión: No se pudo obtener la información del usuario."
          );
        }
      } else {
        console.error("Error al iniciar sesión:", result);
        alert(result.message);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de red al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <SimpleHeader />
      <div className="container d-flex flex-column align-items-center justify-content-center bg-white mt-5 flex-grow-1">
        <div className="text-center mb-4">
          <h2>INGRESÁ CON TU E-MAIL Y CONTRASEÑA</h2>
        </div>
        <div className="d-flex flex-row bg-dark p-4">
          <div className="col-md-4 d-none d-md-flex align-items-center justify-content-center">
            <img src="/hondaForm.jpg" alt="Moto" className="img-fluid" />
          </div>

          <div className="col-md-8 d-flex flex-column justify-content-center p-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3 text-center">
                <label className="form-label text-white">E-MAIL</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? "is-invalid" : ""}`}
                  {...register("email", {
                    required: "El correo es obligatorio",
                  })}
                  disabled={isLoading}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              <div className="mb-3 text-center">
                <label className="form-label text-white">CONTRASEÑA</label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  {...register("password", {
                    required: "La contraseña es obligatoria",
                  })}
                  disabled={isLoading}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-danger w-100 mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                ) : (
                  "INICIAR SESIÓN"
                )}
              </button>
            </form>
          </div>
        </div>
        <div className="mt-3 mb-5">
          <Link
            to="/forgot-password"
            className="text-danger fw-bold text-decoration-none"
          >
            ¿No recuerdas tu contraseña? Hacé click aquí
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LoginView;