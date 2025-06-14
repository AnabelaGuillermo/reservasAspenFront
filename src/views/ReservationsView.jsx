import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "../css/ReservationsView.css";

const ReservationsView = () => {
  const [reservations, setReservations] = useState([]);
  const [users, setUsers] = useState([]);
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingReservationId, setEditingReservationId] = useState(null);
  const [editedObservations, setEditedObservations] = useState("");
  const [isAddingManualReservation, setIsAddingManualReservation] =
    useState(false);
  const [newReservation, setNewReservation] = useState({
    userId: "",
    motoId: "",
    comanda: "",
    recibo: "",
    cliente: "",
    observaciones: "",
  });

  const API_URL_RESERVAS =
    import.meta.env.VITE_BACKEND_URL + "/api/v1/reservas";
  const API_URL_USERS = import.meta.env.VITE_BACKEND_URL + "/api/v1/users";
  const API_URL_MOTOS = import.meta.env.VITE_BACKEND_URL + "/api/v1/motos";
  const token = localStorage.getItem("token");

  const fetchReservations = async () => {
    setLoading(true);
    setError(null);
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
      setReservations(data.data || []);
    } catch (err) {
      console.error("Error al obtener las reservas:", err);
      setError("Error al cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  const fetchNonAdminUsers = async () => {
    try {
      const res = await fetch(`${API_URL_USERS}?isAdmin=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data.data || []);
    } catch (err) {
      console.error("Error al obtener los vendedores:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los vendedores.",
      });
    }
  };

  const fetchAvailableMotos = async () => {
    try {
      const res = await fetch(API_URL_MOTOS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setMotos(data.data || []);
    } catch (err) {
      console.error("Error al obtener las motos:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las motos disponibles.",
      });
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchNonAdminUsers();
    fetchAvailableMotos();
  }, []);

  const handleEditClick = (reservation) => {
    setEditingReservationId(reservation._id);
    setEditedObservations(reservation.observaciones || "");
  };

  const handleSaveObservations = async (id) => {
    try {
      const res = await fetch(`${API_URL_RESERVAS}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ observaciones: editedObservations }),
      });
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudieron guardar las observaciones.",
        });
        return;
      }
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Observaciones guardadas correctamente.",
      });
      setEditingReservationId(null);
      fetchReservations();
    } catch (err) {
      console.error("Error al guardar las observaciones:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un problema al guardar las observaciones.",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingReservationId(null);
  };

  const handleDeleteReservation = async (id, motoId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto! El stock de la moto se incrementará automáticamente.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const deleteRes = await fetch(`${API_URL_RESERVAS}/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const deleteData = await deleteRes.json();
          if (!deleteRes.ok) {
            Swal.fire({
              icon: "error",
              title: "Error al eliminar",
              text: deleteData.message || "No se pudo eliminar la reserva.",
            });
            return;
          }

          fetchReservations();
        } catch (err) {
          console.error(
            "Error general al eliminar la reserva o devolver el stock:",
            err
          );
          Swal.fire({
            icon: "error",
            title: "Error crítico",
            text: "Hubo un problema inesperado al procesar la eliminación. Contacte soporte.",
          });
        }
      }
    });
  };

  const handleAddManualReservationClick = () => {
    setIsAddingManualReservation(true);
    setNewReservation({
      userId: "",
      motoId: "",
      comanda: "",
      recibo: "",
      cliente: "",
      observaciones: "",
    });
  };

  const handleManualReservationInputChange = (e) => {
    const { name, value } = e.target;
    setNewReservation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleConfirmManualReservation = async () => {
    if (
      !newReservation.userId ||
      !newReservation.motoId ||
      !newReservation.comanda ||
      !newReservation.recibo ||
      !newReservation.cliente
    ) {
      Swal.fire({
        icon: "warning",
        title: "¡Atención!",
        text: "Por favor, completa todos los campos obligatorios para la reserva manual.",
      });
      return;
    }

    try {
      const now = new Date();

      const fechaParaBackend = now.toISOString().split("T")[0];
      const horaParaBackend = now.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const res = await fetch(API_URL_RESERVAS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: newReservation.userId,
          motoId: newReservation.motoId,
          recibo: newReservation.recibo,
          numeroComanda: newReservation.comanda,
          cliente: newReservation.cliente,
          observaciones: newReservation.observaciones,
          fecha: fechaParaBackend,
          hora: horaParaBackend,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "¡Error!",
          text: data.message || "Error al crear la reserva manual.",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "¡Reserva Creada!",
        text: "La reserva manual se ha creado correctamente.",
      }).then(() => {
        setIsAddingManualReservation(false);
        fetchReservations();
      });
    } catch (error) {
      console.error("Error al crear la reserva manual", error);
      Swal.fire({
        icon: "error",
        title: "¡Error!",
        text: "Hubo un problema al intentar crear la reserva manual.",
      });
    }
  };

  const handleCancelManualReservation = () => {
    setIsAddingManualReservation(false);
    setNewReservation({
      userId: "",
      motoId: "",
      comanda: "",
      recibo: "",
      cliente: "",
      observaciones: "",
    });
  };

  if (loading) {
    return <div className="text-center py-5">Cargando reservas...</div>;
  }

  if (error) {
    return <div className="text-center py-5 text-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Listado de Reservas</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-light">
            <tr className="text-center">
              <th>Fecha</th>
              <th>Vendedor</th>
              <th>Producto / Moto</th>
              <th>Comanda</th>
              <th>Recibo</th>
              <th>Cliente</th>
              <th>Observaciones</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reserva) => (
              <tr key={reserva._id}>
                <td>
                  {(() => {
                    const d = new Date(reserva.fecha);

                    const localDate = new Date(
                      d.getUTCFullYear(),
                      d.getUTCMonth(),
                      d.getUTCDate()
                    );
                    return localDate.toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    });
                  })()}
                </td>
                <td>{reserva.userId ? reserva.userId.fullname : "N/A"}</td>
                <td>{reserva.motoId ? reserva.motoId.name : "N/A"}</td>
                <td>{reserva.numeroComanda}</td>
                <td>{reserva.recibo}</td>
                <td>{reserva.cliente}</td>
                <td>
                  {editingReservationId === reserva._id ? (
                    <>
                      <textarea
                        className="form-control"
                        value={editedObservations}
                        onChange={(e) => setEditedObservations(e.target.value)}
                      />
                      <div className="mt-2">
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleSaveObservations(reserva._id)}
                        >
                          Guardar
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </button>
                      </div>
                    </>
                  ) : (
                    reserva.observaciones
                  )}
                </td>
                <td className="text-center">
                  {editingReservationId !== reserva._id && (
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={() => handleEditClick(reserva)}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDeleteReservation(
                        reserva._id,
                        reserva.motoId ? reserva.motoId._id : null
                      )
                    }
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">
                  No hay reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h3 className="text-center mt-4">Añadir Reserva Manual</h3>
      {!isAddingManualReservation ? (
        <div className="d-flex justify-content-center">
          <button
            className="btn btn-success"
            onClick={handleAddManualReservationClick}
          >
            Añadir Reserva Manual
          </button>
        </div>
      ) : (
        <div className="card p-4 bg-dark text-white mb-5">
          <h4 className="mb-4">Nueva Reserva Manual</h4>
          <div className="mb-3">
            <label htmlFor="userId" className="form-label">
              VENDEDOR
            </label>
            <select
              className="form-select"
              name="userId"
              value={newReservation.userId}
              onChange={handleManualReservationInputChange}
              required
            >
              <option value="">Seleccionar Vendedor</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.fullname}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="motoId" className="form-label">
              PRODUCTO / MOTO
            </label>
            <select
              className="form-select"
              name="motoId"
              value={newReservation.motoId}
              onChange={handleManualReservationInputChange}
              required
            >
              <option value="">Seleccionar Producto</option>
              {motos.map((moto) => (
                <option key={moto._id} value={moto._id}>
                  {moto.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label htmlFor="comanda" className="form-label">
              NÚMERO DE COMANDA
            </label>
            <input
              type="text"
              className="form-control"
              name="comanda"
              value={newReservation.comanda}
              onChange={handleManualReservationInputChange}
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
              name="recibo"
              value={newReservation.recibo}
              onChange={handleManualReservationInputChange}
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
              name="cliente"
              value={newReservation.cliente}
              onChange={handleManualReservationInputChange}
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
              name="observaciones"
              value={newReservation.observaciones}
              onChange={handleManualReservationInputChange}
              maxLength={100}
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-success me-2"
              onClick={handleConfirmManualReservation}
            >
              AÑADIR
            </button>
            <button
              className="btn btn-danger"
              onClick={handleCancelManualReservation}
            >
              CANCELAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsView;
