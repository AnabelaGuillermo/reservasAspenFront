import React from "react";
import { Link } from "react-router-dom";

const Error404View = () => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <h2 className="display-1 text-danger fw-bold">404</h2>
        <p className="lead fs-3">Página no encontrada</p>
        <p className="text-muted mb-4">
          Lo sentimos, parece que ha habido un error
        </p>
      </div>
      <div>
        <Link to="/" className="btn btn-primary btn-lg px-5 py-3 shadow-sm">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default Error404View;
