import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const DeliverView = () => {
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [entregadosRecientemente, setEntregadosRecientemente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const API_URL_RESERVAS =
    import.meta.env.VITE_BACKEND_URL + "/api/v1/reservas";

  const fetchReservasPendientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL_RESERVAS, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error(`Error HTTP: ${res.status}`);
      }
      const data = await res.json();
      setReservasPendientes(data.data || []);
    } catch (err) {
      console.error("Error al obtener las reservas pendientes", err);
      setError("Error al cargar las reservas pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservasPendientes();
  }, []);

  const handleEntregarReserva = async (id) => {
    Swal.fire({
      title: "¿Entregar reserva?",
      text: "¿Estás seguro de que deseas marcar esta reserva como entregada?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, entregar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL_RESERVAS}/${id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) {
            throw new Error(`Error al entregar la reserva: ${res.status}`);
          }
          const data = await res.json();
          Swal.fire(
            "¡Entregado!",
            data.message || "La reserva ha sido marcada como entregada.",
            "success"
          );
          const reservaEntregada = reservasPendientes.find(
            (reserva) => reserva._id === id
          );
          setReservasPendientes(
            reservasPendientes.filter((reserva) => reserva._id !== id)
          );
          setEntregadosRecientemente((prevEntregados) => [
            ...prevEntregados,
            { ...reservaEntregada, entregadoEn: Date.now() },
          ]);
          setTimeout(() => {
            setEntregadosRecientemente((prev) =>
              prev.filter(
                (entregado) => Date.now() - entregado.entregadoEn < 300000
              )
            );
          }, 300000);
        } catch (error) {
          console.error("Error al entregar la reserva", error);
          Swal.fire(
            "¡Error!",
            "Hubo un problema al entregar la reserva.",
            "error"
          );
        }
      }
    });
  };

  const handleDeshacerEntrega = (reserva) => {
    console.log("Reserva a deshacer:", reserva);

    Swal.fire({
      title: "¿Deshacer entrega?",
      text: "¿Estás seguro de que deseas deshacer la entrega de esta reserva?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, deshacer",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${API_URL_RESERVAS}/restore`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              motoId: reserva.motoId?._id || reserva.motoId,
              fecha: reserva.fecha,
              hora: reserva.hora,
              recibo: reserva.recibo,
              numeroComanda: reserva.numeroComanda,
              cliente: reserva.cliente,
              observaciones: reserva.observaciones,
              userId: reserva.userId?._id || reserva.userId,
            }),
          });
          if (!res.ok) {
            throw new Error(`Error al deshacer la entrega: ${res.status}`);
          }
          const data = await res.json();
          Swal.fire(
            "¡Deshecho!",
            "La entrega ha sido deshecha y la reserva ha vuelto a la lista.",
            "success"
          );
          setEntregadosRecientemente(
            entregadosRecientemente.filter(
              (entregado) => entregado._id !== reserva._id
            )
          );
          fetchReservasPendientes();
        } catch (error) {
          console.error("Error al deshacer la entrega", error);
          Swal.fire(
            "¡Error!",
            "Hubo un problema al deshacer la entrega.",
            "error"
          );
        }
      }
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
      <h2 className="text-center mb-4">Entregar Reservas</h2>

      <h3>Reservas Pendientes</h3>
      <table className="table table-striped table-bordered text-center">
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
          {reservasPendientes.length === 0 ? (
            <tr>
              <td colSpan="8">No hay reservas pendientes.</td>
            </tr>
          ) : (
            reservasPendientes.map((reserva) => (
              <tr key={reserva._id}>
                <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
                <td>{reserva.userId?.fullname}</td>
                <td>
                  {reserva.motoId?.name}
                </td>
                <td>{reserva.numeroComanda}</td>
                <td>{reserva.recibo}</td>
                <td>{reserva.cliente}</td>
                <td>{reserva.observaciones}</td>
                <td>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleEntregarReserva(reserva._id)}
                  >
                    Entregar
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3 className="mt-4">Entregados Recientemente</h3>
      <p className="text-muted">
        Las entregas se pueden deshacer durante los próximos 5 minutos.
      </p>
      <table className="table table-striped table-bordered text-center">
        <thead className="table-light">
          <tr>
            <th>Fecha</th>
            <th>Fecha de Entrega</th>
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
          {entregadosRecientemente.length === 0 ? (
            <tr>
              <td colSpan="9">No hay entregas recientes para deshacer.</td>
            </tr>
          ) : (
            entregadosRecientemente.map((reserva) => (
              <tr key={reserva._id}>
                <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
                <td>{new Date(reserva.entregadoEn).toLocaleDateString()}</td>
                <td>{reserva.userId?.fullname || "N/A"}</td>
                <td>
                  {reserva.motoId?.name || "N/A"} /{" "}
                  {reserva.motoId?.patente || "N/A"}
                </td>
                <td>{reserva.numeroComanda}</td>
                <td>{reserva.recibo}</td>
                <td>{reserva.cliente}</td>
                <td>{reserva.observaciones}</td>
                <td>
                  <button
                    className="btn btn-warning btn-sm"
                    onClick={() => handleDeshacerEntrega(reserva)}
                  >
                    Deshacer
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DeliverView;
