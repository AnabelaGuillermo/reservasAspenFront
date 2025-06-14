import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import SimpleHeader from "../components/CommonLogin/HeaderLogin";
import Footer from "../components/Common/Footer";

const ForgotPasswordView = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/forgot-password`,
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
        toast.success(result.message);
        navigate("/login");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error de red:", error);
      toast.error("Error de red al solicitar la recuperación de contraseña.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <SimpleHeader />
      <div className="container d-flex flex-column align-items-center justify-content-center bg-white mt-5 flex-grow-1 mb-5">
        <div className="text-center mb-4">
          <h2>RECUPERAR CONTRASEÑA</h2>
          <p>
            Ingresa tu email y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>
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
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "El correo electrónico no es válido",
                    },
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>
              <button type="submit" className="btn btn-danger w-100 mt-2">
                ENVIAR ENLACE DE RECUPERACIÓN
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPasswordView;
