import React, { useState, useEffect } from "react";
import { decodeJWT } from "../utilities/decodeJWT";
import "../css/RecordView.css";

const API_URL_BASE = import.meta.env.VITE_BACKEND_URL;
const API_URL_ACTIVIDADES = `${API_URL_BASE}/api/v1/actividades`;

const RecordView = () => {
  const [historial, setHistorial] = useState([]);
  const token = localStorage.getItem("token");
  const user = token ? decodeJWT(token) : null;
  const isAdmin = user ? user.isAdmin : false;

  const fetchActivities = () => {
    if (isAdmin) {
      const fetchOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      fetch(API_URL_ACTIVIDADES, fetchOptions)
        .then((response) => {
          if (response.status === 304) {
            console.warn(
              "RecordView: Received 304 Not Modified. No new data from server."
            );
            return { data: [] };
          }

          if (!response.ok) {
            console.error(
              "RecordView: HTTP Error response not OK:",
              response.statusText
            );
            return response
              .json()
              .then((err) => {
                throw new Error(
                  `HTTP error! status: ${response.status}, message: ${
                    err.message || response.statusText
                  }`
                );
              })
              .catch(() => {
                throw new Error(`HTTP error! status: ${response.status}`);
              });
          }

          return response.json();
        })
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            setHistorial(data.data);
          } else {
            console.warn(
              "RecordView: Data is not in expected format or is empty.",
              data
            );
            setHistorial([]);
          }
        })
        .catch((error) =>
          console.error("RecordView.jsx: Error al obtener el historial:", error)
        );
    } else {
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [isAdmin, token]);

  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar todo el historial de actividades? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(API_URL_ACTIVIDADES, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Error al limpiar el historial: ${
            errorData.message || response.statusText
          }`
        );
      }

      const data = await response.json();
      alert(data.message);
      setHistorial([]);
    } catch (error) {
      console.error("Error al limpiar el historial:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isAdmin) {
    return <div>No tienes permiso para ver esta página.</div>;
  }

  return (
    <div className="record-view-container">
      <div className="record-view-header">
        <h2>Historial de Actividades</h2>
        <button onClick={handleClearHistory} className="clear-history-button">
          Limpiar Historial
        </button>
      </div>
      <table className="record-table">
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Acción</th>
            <th>Fecha y Hora</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          {historial.length > 0 ? (
            historial.map((record) => (
              <tr key={record._id}>
                <td>
                  {record.usuarioId
                    ? `${record.usuarioId.fullname} (${record.usuarioId.email})`
                    : "N/A"}
                </td>
                <td>{record.accion}</td>
                <td>{new Date(record.fechaHora).toLocaleString()}</td>
                <td>{record.detalles}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No hay actividades en el historial.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RecordView;
