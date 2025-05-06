import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const DELAY_TIEMPO_ENTREGADO = 300000;
const LOCAL_STORAGE_KEY = "entregadosRecientemente";

const DeliverView = () => {
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [entregadosRecientemente, setEntregadosRecientemente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const API_URL_RESERVAS =
    import.meta.env.VITE_BACKEND_URL + "/api/v1/reservas";

  const fetchReservasPendientes = async () => {
    console.log("fetchReservasPendientes ejecutándose...");
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
      const entregadosIds = entregadosRecientemente.map(
        (entregado) => entregado._id
      );
      const pendientesFiltradas = (data.data || []).filter(
        (reserva) => !entregadosIds.includes(reserva._id)
      );
      console.log("Reservas pendientes obtenidas:", pendientesFiltradas);
      setReservasPendientes(pendientesFiltradas);
    } catch (err) {
      console.error("Error al obtener las reservas pendientes", err);
      setError("Error al cargar las reservas pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log(
      "Primer useEffect (montaje y carga inicial de entregados) ejecutándose..."
    );
    const cargarEntregados = () => {
      const storedEntregados = localStorage.getItem(LOCAL_STORAGE_KEY);
      let initialEntregados = [];
      if (storedEntregados) {
        initialEntregados = JSON.parse(storedEntregados).filter((entregado) => {
          const tiempoTranscurrido =
            Date.now() - new Date(entregado.fechaEntrega).getTime();
          return tiempoTranscurrido < DELAY_TIEMPO_ENTREGADO;
        });
      }
      setEntregadosRecientemente(initialEntregados);
      console.log("Entregados cargados de localStorage:", initialEntregados);
    };

    cargarEntregados();
    console.log(
      "Primer useEffect (montaje y carga inicial de entregados) terminado."
    );
  }, []);

  useEffect(() => {
    console.log(
      "Segundo useEffect (recarga de pendientes al cambiar entregadosRecientemente) ejecutándose...",
      entregadosRecientemente
    );
    fetchReservasPendientes();
    console.log(
      "Segundo useEffect (recarga de pendientes al cambiar entregadosRecientemente) terminado."
    );
  }, [entregadosRecientemente]);

  useEffect(() => {
    console.log(
      "Tercer useEffect (seguimiento de entregadosRecientemente para eliminación) ejecutándose...",
      entregadosRecientemente
    );
    entregadosRecientemente.forEach((reserva) => {
      const tiempoRestante =
        DELAY_TIEMPO_ENTREGADO -
        (Date.now() - new Date(reserva.fechaEntrega).getTime());
      if (tiempoRestante > 0) {
        const timeoutId = setTimeout(() => {
          eliminarReservaDefinitivamente(reserva._id);
        }, tiempoRestante);
      } else {
        eliminarReservaDefinitivamente(reserva._id);
      }
    });
    console.log(
      "Tercer useEffect (seguimiento de entregadosRecientemente para eliminación) terminado."
    );
  }, [entregadosRecientemente]);

  const handleEntregarReserva = async (id) => {
    console.log("handleEntregarReserva ejecutándose para ID:", id);
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
          const res = await fetch(`${API_URL_RESERVAS}/${id}/entregar`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
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
          const nuevaReservaEntregada = {
            ...reservaEntregada,
            fechaEntrega: new Date().toISOString(),
          };
          setEntregadosRecientemente((prevEntregados) => [
            ...prevEntregados,
            nuevaReservaEntregada,
          ]);
          const storedEntregados =
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
          const entregados = JSON.parse(storedEntregados);
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify([...entregados, nuevaReservaEntregada])
          );
          console.log("Reserva entregada, estados actualizados.");
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

  const handleDeshacerEntrega = async (reserva) => {
    console.log("handleDeshacerEntrega ejecutándose para ID:", reserva._id);
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
              _id: reserva._id,
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
          setEntregadosRecientemente((prev) =>
            prev.filter((entregado) => entregado._id !== reserva._id)
          );
          const storedEntregados =
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
          const entregados = JSON.parse(storedEntregados);
          localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(entregados.filter((e) => e._id !== reserva._id))
          );
          fetchReservasPendientes();
          console.log("Entrega deshecha, estados actualizados.");
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

  const eliminarReservaDefinitivamente = async (id) => {
    console.log("eliminarReservaDefinitivamente ejecutándose para ID:", id);
    try {
      const res = await fetch(`${API_URL_RESERVAS}/entregadas/${id}/mover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setEntregadosRecientemente((prev) =>
          prev.filter((entregado) => entregado._id !== id)
        );
        const storedEntregados =
          localStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
        const entregados = JSON.parse(storedEntregados);
        localStorage.setItem(
          LOCAL_STORAGE_KEY,
          JSON.stringify(entregados.filter((e) => e._id !== id))
        );
        fetchReservasPendientes();
        console.log("Reserva eliminada definitivamente.");
      } else {
        console.error("Error al mover la reserva entregada al backend");
      }
    } catch (error) {
      console.error("Error al mover la reserva entregada", error);
    }
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
                <td>{reserva.motoId?.name}</td>
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
                <td>{new Date(reserva.fechaEntrega).toLocaleDateString()}</td>
                <td>{reserva.userId?.fullname || "N/A"}</td>
                <td>
                  {reserva.motoId?.name || "N/A"}
                  {reserva.motoId?.patente
                    ? ` / ${reserva.motoId.patente}`
                    : ""}
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
