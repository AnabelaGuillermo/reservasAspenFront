import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const MyReservationsView = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const formatReservationDate = (dateString) => {
    const d = new Date(dateString);
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
  };

  const filteredReservas = reservas.filter((reserva) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const matchesCliente = reserva.cliente.toLowerCase().includes(lowerCaseSearchTerm);
    const matchesComanda = reserva.numeroComanda.toLowerCase().includes(lowerCaseSearchTerm);
    const matchesRecibo = reserva.recibo.toLowerCase().includes(lowerCaseSearchTerm);
    const matchesMoto = reserva.motoId?.name.toLowerCase().includes(lowerCaseSearchTerm);
    const matchesObservaciones = reserva.observaciones?.toLowerCase().includes(lowerCaseSearchTerm);

    return matchesCliente || matchesComanda || matchesRecibo || matchesMoto || matchesObservaciones;
  });

  if (loading)
    return (
      <div className="container mt-4 text-center">
        <p>Cargando reservas...</p>
      </div>
    );
  if (error)
    return (
      <div className="container mt-4 text-center">
        <p className="text-danger">{error}</p>
      </div>
    );

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Mis reservas</h2>
      <div className="mb-3">
        <label htmlFor="searchReservation" className="form-label">
          Buscar en mis reservas:
        </label>
        <input
          type="text"
          id="searchReservation"
          className="form-control"
          placeholder="Buscar por cliente, comanda, recibo, producto/moto o observaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredReservas.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay reservas que coincidan con la búsqueda.
        </div>
      ) : (
        <>
          <div className="table-responsive d-none d-md-block">
            <table className="table table-striped table-bordered text-center align-middle">
              <thead>
                <tr>
                  <th className="bg-dark text-white">FECHA</th>
                  <th className="bg-dark text-white">PRODUCTO / MOTO</th>
                  <th className="bg-dark text-white">COMANDA</th>
                  <th className="bg-dark text-white">RECIBO</th>
                  <th className="bg-dark text-white">CLIENTE</th>
                  <th className="bg-dark text-white">OBSERVACIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservas.map((reserva) => (
                  <tr key={reserva._id}>
                    <td>{formatReservationDate(reserva.fecha)}</td>
                    <td>{reserva.motoId?.name || "N/A"}</td>
                    <td>{reserva.numeroComanda}</td>
                    <td>{reserva.recibo}</td>
                    <td>{reserva.cliente}</td>
                    <td>{reserva.observaciones}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-md-none">
            {filteredReservas.map((reserva) => (
              <div className="card mb-3" key={reserva._id}>
                <div className="card-body">
                  <h5 className="card-title">
                    Reserva del {formatReservationDate(reserva.fecha)}
                  </h5>
                  <p className="card-text">
                    <strong>Producto / Moto:</strong>{" "}
                    {reserva.motoId?.name || "N/A"}
                  </p>
                  <p className="card-text">
                    <strong>Comanda:</strong> {reserva.numeroComanda}
                  </p>
                  <p className="card-text">
                    <strong>Recibo:</strong> {reserva.recibo}
                  </p>
                  <p className="card-text">
                    <strong>Cliente:</strong> {reserva.cliente}
                  </p>
                  <p className="card-text">
                    <strong>Observaciones:</strong> {reserva.observaciones}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MyReservationsView;