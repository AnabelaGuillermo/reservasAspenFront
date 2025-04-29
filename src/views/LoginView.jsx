import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useSession } from "../stores/useSession";

const LoginView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  const { login } = useSession();

  const onSubmit = async (data) => {
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
        console.log("Inicio de sesión exitoso:", result);

        login(result.user, result.token);

        if (result.user?.isAdmin) {
          navigate("/Reservas");
        } else {
          navigate("/Reservar");
        }
      } else {
        console.error("Error al iniciar sesión:", result);
        alert(result.message);
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("Error de red al iniciar sesión");
    }
  };

  return (
    <>
      <div className="container d-flex flex-column align-items-center justify-content-center bg-white mt-5">
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
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-danger w-100 mt-2">
                INICIAR SESIÓN
              </button>
            </form>
          </div>
        </div>
        <div className="mt-3">
          <a href="/*" className="text-danger fw-bold text-decoration-none">
            ¿No recuerdas tu contraseña? Hacé click aquí
          </a>
        </div>
      </div>
    </>
  );
};

export default LoginView;
