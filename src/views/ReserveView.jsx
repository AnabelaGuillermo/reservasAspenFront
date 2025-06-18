import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

import "../css/ReserveView.css";

const ReserveView = () => {
  const [availableMotos, setAvailableMotos] = useState([]);
  const [allReservas, setAllReservas] = useState([]);
  const [selectedMotoToReserve, setSelectedMotoToReserve] = useState(null);
  const [recibo, setRecibo] = useState("");
  const [numeroComanda, setNumeroComanda] = useState("");
  const [cliente, setCliente] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  const API_URL_MOTOS = import.meta.env.VITE_BACKEND_URL + "/api/v1/motos";
  const API_URL_RESERVAS =
    import.meta.env.VITE_BACKEND_URL + "/api/v1/reservas";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const userInfo = localStorage.getItem("user");
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        if (user && user._id) {
          setLoggedInUserId(user._id);
        } else {
          console.warn("User info found but _id is missing:", user);
          Swal.fire({
            icon: "warning",
            title: "Advertencia",
            text: "No se pudo obtener el ID de usuario. Por favor, asegúrate de haber iniciado sesión correctamente.",
          });
        }
      } catch (e) {
        console.error("Error parsing user info from localStorage", e);
        Swal.fire({
          icon: "error",
          title: "Error de Sesión",
          text: "Hubo un problema al cargar tu información de usuario. Por favor, intenta recargar la página o iniciar sesión de nuevo.",
        });
      }
    } else {
      console.warn("No user info found in localStorage.");
    }

    fetchAvailableMotos();
    fetchAllReservas();
  }, []);

  const fetchAvailableMotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL_MOTOS);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAvailableMotos(data.data || []);
    } catch (err) {
      console.error("Error al obtener motos disponibles", err);
      setError("Error al cargar la lista de motos disponibles.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllReservas = async () => {
    try {
      const res = await fetch(API_URL_RESERVAS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAllReservas(data.data || []);
    } catch (err) {
      console.error("Error al obtener todas las reservas", err);
    }
  };

  const handleReservarClick = (moto) => {
    setSelectedMotoToReserve(moto);
  };

  const handleConfirmarReserva = async (e) => {
    e.preventDefault();

    if (!selectedMotoToReserve) {
      Swal.fire({
        icon: "warning",
        title: "¡Atención!",
        text: "Por favor, selecciona un producto para reservar.",
      });
      return;
    }

    if (!recibo || !numeroComanda || !cliente) {
      Swal.fire({
        icon: "warning",
        title: "¡Atención!",
        text: "Por favor, completa todos los campos requeridos (Recibo, Número de Comanda, Cliente).",
      });
      return;
    }

    const isDuplicateRecibo = allReservas.some(
      (reserva) => reserva.recibo === recibo && reserva.isActive
    );
    const isDuplicateComanda = allReservas.some(
      (reserva) => reserva.numeroComanda === numeroComanda && reserva.isActive
    );

    if (isDuplicateRecibo || isDuplicateComanda) {
      let errorMessage = "Ya existe una reserva con ";
      if (isDuplicateRecibo && isDuplicateComanda) {
        errorMessage += "este número de recibo y este número de comanda.";
      } else if (isDuplicateRecibo) {
        errorMessage += "este número de recibo.";
      } else {
        errorMessage += "este número de comanda.";
      }
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: errorMessage,
      });
      return;
    }

    if (!loggedInUserId) {
      Swal.fire({
        icon: "error",
        title: "Error de Sesión",
        text: "No se pudo obtener el ID del usuario logueado. Por favor, intenta iniciar sesión nuevamente o recarga la página.",
      });
      return;
    }

    try {
      const now = new Date();
      const fechaActual = now
        .toLocaleDateString("es-AR")
        .split("/")
        .reverse()
        .join("-");
      const horaActual = now.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const res = await fetch(API_URL_RESERVAS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: loggedInUserId,
          motoId: selectedMotoToReserve._id,
          recibo,
          numeroComanda,
          cliente,
          observaciones,
          fecha: fechaActual,
          hora: horaActual,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: data.message || "Error al realizar la reserva.",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Reserva Exitosa!",
        text: "La reserva se ha realizado correctamente.",
      }).then(() => {
        setSelectedMotoToReserve(null);
        setRecibo("");
        setNumeroComanda("");
        setCliente("");
        setObservaciones("");
        fetchAvailableMotos();
        fetchAllReservas();
      });
    } catch (error) {
      console.error("Error al realizar la reserva", error);
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "Hubo un problema al intentar realizar la reserva. Revisa la consola para más detalles.",
      });
    }
  };

  const handleCancelarReserva = () => {
    setSelectedMotoToReserve(null);
    setRecibo("");
    setNumeroComanda("");
    setCliente("");
    setObservaciones("");
  };

  if (loading) {
    return (
      <div className="text-center py-5">Cargando motos disponibles...</div>
    );
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4">DISPONIBLE PARA RESERVAR</h3>
      <div className="table-responsive mb-4">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="bg-dark text-white">PRODUCTO / MOTO</th>
              <th className="text-center bg-dark text-white">DISPONIBLE</th>
              <th className="text-end bg-dark text-white">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {availableMotos.map((moto) => (
              <tr key={moto._id}>
                <td>{moto.name}</td>
                <td className="text-center">{moto.quantity}</td>
                <td className="text-end">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleReservarClick(moto)}
                    disabled={moto.quantity === 0}
                  >
                    RESERVAR
                  </button>
                </td>
              </tr>
            ))}
            {availableMotos.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No hay productos disponibles para reservar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMotoToReserve && (
        <div className="mb-4 p-4 border rounded formReserve">
          <h4 className="text-center mb-3">
            POR FAVOR, CARGÁ LOS DATOS DE LA RESERVA
          </h4>
          <form onSubmit={handleConfirmarReserva}>
            <div className="mb-3">
              <label htmlFor="producto" className="form-label">
                PRODUCTO / MOTO
              </label>
              <input
                type="text"
                className="form-control"
                id="producto"
                value={selectedMotoToReserve.name}
                readOnly
              />
            </div>
            <div className="mb-3">
              <label htmlFor="comanda" className="form-label">
                NÚMERO DE COMANDA
              </label>
              <input
                type="text"
                className="form-control"
                id="comanda"
                value={numeroComanda}
                onChange={(e) => setNumeroComanda(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="recibo" className="form-label">
                RECIBO
              </label>
              <input
                type="text"
                className="form-control"
                id="recibo"
                value={recibo}
                onChange={(e) => setRecibo(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="cliente" className="form-label">
                CLIENTE
              </label>
              <input
                type="text"
                className="form-control"
                id="cliente"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                maxLength={50}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="observaciones" className="form-label">
                OBSERVACIONES
              </label>
              <textarea
                className="form-control"
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-success">
                CONFIRMAR RESERVA
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancelarReserva}
              >
                CANCELAR
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReserveView;
