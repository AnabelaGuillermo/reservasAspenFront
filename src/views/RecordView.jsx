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

  console.log("RecordView: is Admin?", isAdmin);

  useEffect(() => {
    if (isAdmin) {
      console.log("RecordView: Fetching activities from:", API_URL_ACTIVIDADES);

      const fetchOptions = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      fetch(API_URL_ACTIVIDADES, fetchOptions)
        .then((response) => {
          console.log("RecordView: Response status:", response.status);

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
          console.log("RecordView: Data received:", data);
          if (data && Array.isArray(data.data)) {
            setHistorial(data.data);
            console.log(
              "RecordView: Historial updated with",
              data.data.length,
              "items."
            );
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
      console.log("RecordView: User is not admin, not fetching activities.");
    }
  }, [isAdmin, token]);

  if (!isAdmin) {
    return <div>No tienes permiso para ver esta página.</div>;
  }

  return (
    <div className="record-view-container">
      <h2>Historial de Actividades</h2>
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
          {historial.map((record) => (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordView;
