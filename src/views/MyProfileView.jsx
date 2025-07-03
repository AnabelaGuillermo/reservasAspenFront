import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/MyProfileView.css";

const MyProfileView = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getLoggedInUserFromlocalStorage = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        return JSON.parse(userString);
      } catch (e) {
        console.error("Error al parsear el objeto 'user' de localStorage:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    const loggedInUser = getLoggedInUserFromlocalStorage();
    if (loggedInUser) {
      setCurrentUser(loggedInUser);
    } else {
      setError(
        "No se pudo encontrar la información de tu perfil. Por favor, inicia sesión."
      );
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center mt-5">Cargando tu perfil...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-5">Error: {error}</div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">MI PERFIL</h2>
      {currentUser ? (
        <div className="my-profile-card">
          <div className="profile-row">
            <span className="profile-label">NOMBRE</span>
            <span className="profile-value">{currentUser.fullname}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">E-MAIL</span>
            <span className="profile-value">{currentUser.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">ROL</span>
            <span className="profile-value">VENDEDOR</span>
          </div>
        </div>
      ) : (
        <div className="alert alert-info text-center">
          No se pudo cargar tu información de perfil.
        </div>
      )}
    </div>
  );
};

export default MyProfileView;
