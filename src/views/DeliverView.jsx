import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "../css/DeliverView.css";

const DELAY_TIEMPO_ENTREGADO = 300000;
const LOCAL_STORAGE_KEY = "entregadosRecientemente";

const DeliverView = () => {
  const [reservasPendientes, setReservasPendientes] = useState([]);
  const [entregadosRecientemente, setEntregadosRecientemente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);

  const [selectedSellerPendientes, setSelectedSellerPendientes] = useState("");
  const [searchTermPendientes, setSearchTermPendientes] = useState("");

  const [selectedSellerEntregados, setSelectedSellerEntregados] = useState("");
  const [searchTermEntregados, setSearchTermEntregados] = useState("");

  const token = sessionStorage.getItem("token");
  const API_URL_RESERVAS =
    import.meta.env.VITE_BACKEND_URL + "/api/v1/reservas";
  const API_URL_USERS = import.meta.env.VITE_BACKEND_URL + "/api/v1/users";

  const timeoutsRef = useRef({});

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

      const entregadosIds = entregadosRecientemente.map(
        (entregado) => entregado._id
      );
      const pendientesFiltradas = (data.data || []).filter(
        (reserva) => !entregadosIds.includes(reserva._id)
      );

      setReservasPendientes(pendientesFiltradas);
    } catch (err) {
      console.error("Error al obtener las reservas pendientes", err);
      setError("Error al cargar las reservas pendientes.");
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
        text: "No se pudieron cargar los vendedores para los filtros.",
      });
    }
  };

  useEffect(() => {
    const cargarEntregados = () => {
      const storedEntregados = sessionStorage.getItem(LOCAL_STORAGE_KEY);
      let initialEntregados = [];
      if (storedEntregados) {
        initialEntregados = JSON.parse(storedEntregados).filter((entregado) => {
          const tiempoTranscurrido =
            Date.now() - new Date(entregado.fechaEntrega).getTime();
          return tiempoTranscurrido < DELAY_TIEMPO_ENTREGADO;
        });
      }
      setEntregadosRecientemente(initialEntregados);
    };

    cargarEntregados();
    fetchNonAdminUsers();
  }, []);

  useEffect(() => {
    fetchReservasPendientes();
  }, [entregadosRecientemente]);

  useEffect(() => {
    for (const id in timeoutsRef.current) {
      clearTimeout(timeoutsRef.current[id]);
    }
    timeoutsRef.current = {};

    entregadosRecientemente.forEach((reserva) => {
      const tiempoTranscurrido =
        Date.now() - new Date(reserva.fechaEntrega).getTime();
      const tiempoRestante = DELAY_TIEMPO_ENTREGADO - tiempoTranscurrido;

      if (tiempoRestante > 0) {
        if (!timeoutsRef.current[reserva._id]) {
          const timeoutId = setTimeout(() => {
            eliminarReservaDefinitivamente(reserva._id);
          }, tiempoRestante);
          timeoutsRef.current[reserva._id] = timeoutId;
        }
      } else {
        if (entregadosRecientemente.some((e) => e._id === reserva._id)) {
          eliminarReservaDefinitivamente(reserva._id);
        }
      }
    });

    return () => {
      for (const id in timeoutsRef.current) {
        clearTimeout(timeoutsRef.current[id]);
      }
    };
  }, [entregadosRecientemente]);

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
            sessionStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
          const entregados = JSON.parse(storedEntregados);
          sessionStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify([...entregados, nuevaReservaEntregada])
          );
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
            sessionStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
          const entregados = JSON.parse(storedEntregados);
          sessionStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(entregados.filter((e) => e._id !== reserva._id))
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

  const eliminarReservaDefinitivamente = async (id) => {
    try {
      const res = await fetch(`${API_URL_RESERVAS}/entregadas/${id}/mover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const responseData = await res.json();
        if (
          responseData.message ===
          "La reserva ya ha sido movida a entregados permanentemente."
        ) {
        } else {
          setEntregadosRecientemente((prev) =>
            prev.filter((entregado) => entregado._id !== id)
          );
          const storedEntregados =
            sessionStorage.getItem(LOCAL_STORAGE_KEY) || "[]";
          const entregados = JSON.parse(storedEntregados);
          sessionStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(entregados.filter((e) => e._id !== id))
          );
        }
      } else {
        console.error(
          "Error al mover la reserva entregada al backend. Estado:",
          res.status
        );
      }
    } catch (error) {
      console.error("Error al mover la reserva entregada", error);
    }
  };

  const filterReservations = (reservas, selectedSeller, searchTerm) => {
    return reservas.filter((reserva) => {
      const matchesSeller = selectedSeller
        ? reserva.userId && reserva.userId._id === selectedSeller
        : true;

      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const matchesSearch =
        reserva.cliente.toLowerCase().includes(lowerCaseSearchTerm) ||
        reserva.numeroComanda.toLowerCase().includes(lowerCaseSearchTerm) ||
        reserva.recibo.toLowerCase().includes(lowerCaseSearchTerm) ||
        (reserva.motoId &&
          reserva.motoId.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (reserva.userId &&
          reserva.userId.fullname
            .toLowerCase()
            .includes(lowerCaseSearchTerm)) ||
        (reserva.observaciones &&
          reserva.observaciones.toLowerCase().includes(lowerCaseSearchTerm));

      return matchesSeller && matchesSearch;
    });
  };

  const filteredReservasPendientes = filterReservations(
    reservasPendientes,
    selectedSellerPendientes,
    searchTermPendientes
  );

  const filteredEntregadosRecientemente = filterReservations(
    entregadosRecientemente,
    selectedSellerEntregados,
    searchTermEntregados
  );

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
      <div className="row mb-3 align-items-center">
        <div className="col-md-4 mb-3 mb-md-0">
          <label htmlFor="sellerFilterPendientes" className="form-label mb-1">
            Filtrar por Vendedor:
          </label>
          <select
            id="sellerFilterPendientes"
            className="form-select"
            value={selectedSellerPendientes}
            onChange={(e) => setSelectedSellerPendientes(e.target.value)}
          >
            <option value="">Todos los Vendedores</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullname}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-8">
          <label htmlFor="searchFilterPendientes" className="form-label mb-1">
            Buscar:
          </label>
          <input
            type="text"
            id="searchFilterPendientes"
            className="form-control"
            placeholder="Buscar por cliente, comanda, recibo, moto o vendedor..."
            value={searchTermPendientes}
            onChange={(e) => setSearchTermPendientes(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="deliver-table">
          <thead className="table-light">
            <tr>
              <th className="text-center">Fecha</th>
              <th className="text-center">Vendedor</th>
              <th className="text-center">Producto / Moto</th>
              <th className="text-center">Comanda</th>
              <th className="text-center">Recibo</th>
              <th className="text-center">Cliente</th>
              <th>Observaciones</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredReservasPendientes.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">
                  No hay reservas pendientes que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredReservasPendientes.map((reserva) => (
                <tr key={reserva._id}>
                  <td data-label="Fecha" className="text-center">
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
                  <td data-label="Vendedor" className="text-center">
                    {reserva.userId?.fullname}
                  </td>
                  <td data-label="Producto / Moto" className="text-center">
                    {reserva.motoId?.name}
                  </td>
                  <td data-label="Comanda" className="text-center">
                    {reserva.numeroComanda}
                  </td>
                  <td data-label="Recibo" className="text-center">
                    {reserva.recibo}
                  </td>
                  <td data-label="Cliente" className="text-center">
                    {reserva.cliente}
                  </td>
                  <td data-label="Observaciones">{reserva.observaciones}</td>
                  <td data-label="Acciones" className="text-center">
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
      </div>

      <h3 className="mt-4">Entregados Recientemente</h3>
      <p className="text-muted">
        Las entregas se pueden deshacer durante los próximos 5 minutos.
      </p>
      <div className="row mb-3 align-items-center">
        <div className="col-md-4 mb-3 mb-md-0">
          <label htmlFor="sellerFilterEntregados" className="form-label mb-1">
            Filtrar por Vendedor:
          </label>
          <select
            id="sellerFilterEntregados"
            className="form-select"
            value={selectedSellerEntregados}
            onChange={(e) => setSelectedSellerEntregados(e.target.value)}
          >
            <option value="">Todos los Vendedores</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.fullname}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-8">
          <label htmlFor="searchFilterEntregados" className="form-label mb-1">
            Buscar:
          </label>
          <input
            type="text"
            id="searchFilterEntregados"
            className="form-control"
            placeholder="Buscar por cliente, comanda, recibo, moto o vendedor..."
            value={searchTermEntregados}
            onChange={(e) => setSearchTermEntregados(e.target.value)}
          />
        </div>
      </div>
      <div className="table-responsive">
        <table className="deliver-table">
          <thead className="table-light">
            <tr>
              <th className="text-center">Fecha</th>
              <th className="text-center">Fecha de Entrega</th>
              <th className="text-center">Vendedor</th>
              <th className="text-center">Producto / Moto</th>
              <th className="text-center">Comanda</th>
              <th className="text-center">Recibo</th>
              <th className="text-center">Cliente</th>
              <th>Observaciones</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntregadosRecientemente.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">
                  No hay entregas recientes que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filteredEntregadosRecientemente.map((reserva) => (
                <tr key={reserva._id}>
                  <td data-label="Fecha" className="text-center">
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
                  <td data-label="Fecha de Entrega" className="text-center">
                    {(() => {
                      const d = new Date(reserva.fechaEntrega);
                      return d.toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      });
                    })()}
                  </td>
                  <td data-label="Vendedor" className="text-center">
                    {reserva.userId?.fullname || "N/A"}
                  </td>
                  <td data-label="Producto / Moto" className="text-center">
                    {reserva.motoId?.name || "N/A"}
                    {reserva.motoId?.patente
                      ? ` / ${reserva.motoId.patente}`
                      : ""}
                  </td>
                  <td data-label="Comanda" className="text-center">
                    {reserva.numeroComanda}
                  </td>
                  <td data-label="Recibo" className="text-center">
                    {reserva.recibo}
                  </td>
                  <td data-label="Cliente" className="text-center">
                    {reserva.cliente}
                  </td>
                  <td data-label="Observaciones">{reserva.observaciones}</td>
                  <td data-label="Acciones" className="text-center">
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
    </div>
  );
};

export default DeliverView;
