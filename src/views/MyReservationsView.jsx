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
      <h3 className="text-center mb-4">MIS RESERVAS</h3>

      {reservas.length === 0 ? (
        <div className="alert alert-info text-center" role="alert">
          No hay reservas registradas.
        </div>
      ) : (
        <>
          <div className="table-responsive d-none d-md-block">
            <table className="table table-striped table-bordered text-center align-middle">
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
                {reservas.map((reserva) => (
                  <tr key={reserva._id}>
                    <td>{new Date(reserva.fecha).toLocaleDateString()}</td>
                    <td>
                      {reserva.motoId?.name ||
                        "N/A"}{" "}
                    </td>
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
            {reservas.map((reserva) => (
              <div className="card mb-3" key={reserva._id}>
                <div className="card-body">
                  <h5 className="card-title">
                    Reserva del {new Date(reserva.fecha).toLocaleDateString()}
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