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

      console.log(
        "Usuarios cargados para el selector (VERIFICAR ESTRUCTURA):",
        data.data
      );
      if (data.data && data.data.length > 0) {
        console.log("Ejemplo de primer usuario cargado:", data.data[0]);
        console.log("Tipo de _id del primer usuario:", typeof data.data[0]._id);
        console.log("Fullname del primer usuario:", data.data[0].fullname);
      }
    } catch (err) {
      console.error("Error al obtener los vendedores:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los vendedores.",
      });
    }
  };

  useEffect(() => {
    fetchReservations();
    fetchNonAdminUsers();
    fetchAvailableMotos();
  }, []);

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
      text: "No podrás revertir esto. El stock de la moto se incrementará.",
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
              title: "Error",
              text: deleteData.message || "No se pudo eliminar la reserva.",
            });
            return;
          }

          const updateMotoRes = await fetch(
            `${API_URL_MOTOS}/${motoId}/incrementStock`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const updateMotoData = await updateMotoRes.json();
          if (!updateMotoRes.ok) {
            console.error("Error al devolver el stock:", updateMotoData);
            Swal.fire({
              icon: "warning",
              title: "Advertencia",
              text: "La reserva se eliminó, pero no se pudo devolver el stock de la moto.",
            });
          } else {
            Swal.fire({
              icon: "success",
              title: "¡Eliminado!",
              text: "La reserva ha sido eliminada y el stock de la moto ha sido devuelto.",
            });
          }

          fetchReservations();
        } catch (err) {
          console.error(
            "Error al eliminar la reserva y devolver el stock:",
            err
          );
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Hubo un problema al eliminar la reserva y devolver el stock.",
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
    console.log(`Input change - Name: ${name}, Raw Value: ${value}`); // Valor crudo del input

    if (name === "userId") {
      let selectedUserId = value;

      if (!/^[0-9a-fA-F]{24}$/.test(value)) {
        console.warn(
          `Valor de userId no es un ObjectId válido: ${value}. Intentando buscar por fullname.`
        );
        const foundUser = users.find((user) => user.fullname === value);
        if (foundUser) {
          selectedUserId = foundUser._id;
          console.log(`Encontrado _id para ${value}: ${selectedUserId}`);
        } else {
          console.error(`No se encontró un usuario con el fullname: ${value}`);
          selectedUserId = "";
        }
      }
      setNewReservation((prevState) => ({
        ...prevState,
        userId: selectedUserId,
      }));
    } else {
      setNewReservation((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
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

    console.log("Datos a enviar para la nueva reserva:", newReservation);
    console.log(
      "ID de Vendedor a enviar (antes de fetch):",
      newReservation.userId
    );

    try {
      const now = new Date();
      const fechaActual = now
        .toLocaleDateString("es-AR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
        .split("/")
        .reverse()
        .join("-");
      const horaActual = now.toLocaleTimeString("es-AR", {
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
          fecha: fechaActual,
          hora: horaActual,
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
            <tr>
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
                <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
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
                <td>
                  {editingReservationId !== reserva._id && (
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => handleEditClick(reserva)}
                    >
                      Editar
                    </button>
                  )}
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() =>
                      handleDeleteReservation(reserva._id, reserva.motoId._id)
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
        <div className="card p-3 mt-3">
          <h4>Nueva Reserva Manual</h4>
          <div className="mb-3">
            <label htmlFor="userId" className="form-label">
              Vendedor
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
              Producto / Moto
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
              Número de Comanda
            </label>
            <input
              type="text"
              className="form-control"
              name="comanda"
              value={newReservation.comanda}
              onChange={handleManualReservationInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="recibo" className="form-label">
              Recibo
            </label>
            <input
              type="text"
              className="form-control"
              name="recibo"
              value={newReservation.recibo}
              onChange={handleManualReservationInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="cliente" className="form-label">
              Cliente
            </label>
            <input
              type="text"
              className="form-control"
              name="cliente"
              value={newReservation.cliente}
              onChange={handleManualReservationInputChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="observaciones" className="form-label">
              Observaciones
            </label>
            <textarea
              className="form-control"
              name="observaciones"
              value={newReservation.observaciones}
              onChange={handleManualReservationInputChange}
            />
          </div>
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-primary"
              onClick={handleConfirmManualReservation}
            >
              Añadir Reserva
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCancelManualReservation}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsView;
