import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate, useParams } from "react-router-dom";
import SimpleHeader from "../components/CommonLogin/HeaderLogin";
import Footer from "../components/Common/Footer";

const ResetPasswordView = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("password");

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }

    const payload = { password: data.password };

    try {
      const url = `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/auth/reset-password/${token}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
        navigate("/login");
      } else {
        toast.error(result.message);
        console.error(
          "Error del backend (response.ok es false):",
          result.message
        );
      }
    } catch (error) {
      console.error("Error de red o en la petición fetch:", error);
      toast.error("Error de red al restablecer la contraseña.");
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <SimpleHeader />
      <div className="container d-flex flex-column align-items-center justify-content-center bg-white mt-5 flex-grow-1 mb-5">
        <div className="text-center mb-4">
          <h2>RESTABLECER CONTRASEÑA</h2>
          <p>Ingresa tu nueva contraseña.</p>
        </div>

        <div className="d-flex flex-row bg-dark p-4">
          <div className="col-md-4 d-none d-md-flex align-items-center justify-content-center">
            <img src="/hondaForm.jpg" alt="Moto" className="img-fluid" />
          </div>

          <div className="col-md-8 d-flex flex-column justify-content-center p-3">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3 text-center">
                <label className="form-label text-white">
                  NUEVA CONTRASEÑA
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.password ? "is-invalid" : ""
                  }`}
                  {...register("password", {
                    required: "La nueva contraseña es obligatoria",
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])([A-Za-z\d$@$!%*?&]|[^ ]){8,15}$/,
                      message:
                        "La contraseña debe tener entre 8 y 15 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.",
                    },
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>
              <div className="mb-3 text-center">
                <label className="form-label text-white">
                  REPETIR CONTRASEÑA
                </label>
                <input
                  type="password"
                  className={`form-control ${
                    errors.confirmPassword ? "is-invalid" : ""
                  }`}
                  {...register("confirmPassword", {
                    required: "Confirmar la contraseña es obligatorio",
                    validate: (value) =>
                      value === newPassword || "Las contraseñas no coinciden",
                  })}
                />
                {errors.confirmPassword && (
                  <div className="invalid-feedback">
                    {errors.confirmPassword.message}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-danger w-100 mt-2">
                RESTABLECER CONTRASEÑA
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPasswordView;
