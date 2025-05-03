import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const MyReservationsView = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL_RESERVAS =
    import.meta.env.VITE_BACKEND_URL + "/api/v1/reservas";
  const token = localStorage.getItem("token");

  const fetchReservas = async () => {
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
      setReservas(data.data || []);
    } catch (err) {
      console.error("Error al obtener reservas", err);
      setError("Error al cargar las reservas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  if (loading) return <p>Cargando reservas...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container mt-4">
      <h3 className="text-center mb-4">MIS RESERVAS</h3>
      <table className="table table-striped table-bordered text-center">
        <thead className="table-light">
          <tr>
            <th>FECHA</th>
            <th>PRODUCTO / MOTO</th>
            <th>COMANDA</th>
            <th>RECIBO</th>
            <th>CLIENTE</th>
            <th>OBSERVACIONES</th>
          </tr>
        </thead>
        <tbody>
          {reservas.length === 0 ? (
            <tr>
              <td colSpan="6">No hay reservas registradas.</td>
            </tr>
          ) : (
            reservas.map((reserva) => (
              <tr key={reserva._id}>
                <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
                <td>{reserva.motoId ? `${reserva.motoId.name || ""}` : ""}</td>
                <td>{reserva.numeroComanda}</td>
                <td>{reserva.recibo}</td>
                <td>{reserva.cliente}</td>{" "}
                <td>{reserva.observaciones}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyReservationsView;
