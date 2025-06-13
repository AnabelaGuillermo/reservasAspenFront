import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

const API_URL_BASE = import.meta.env.VITE_BACKEND_URL;
const API_URL_USERS = `${API_URL_BASE}/api/v1/users`;

const UsersView = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [newUserForm, setNewUserForm] = useState({
    fullname: "",
    email: "",
    password: "",
    isAdmin: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  const getLoggedInUserFromLocalStorage = () => {
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

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No hay token de autenticación. Por favor, inicie sesión.");
        setLoading(false);
        return;
      }

      const loggedInUser = getLoggedInUserFromLocalStorage();
      if (loggedInUser) {
        setCurrentUser(loggedInUser);
      } else {
        console.warn(
          "No se encontró el objeto 'user' en localStorage. El perfil no se mostrará."
        );
      }

      const response = await fetch(API_URL_USERS, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cargar los usuarios");
      }

      const data = await response.json();

      if (loggedInUser) {
        setUsers(data.data.filter((user) => user._id !== loggedInUser._id));
      } else {
        setUsers(data.data);
      }
    } catch (err) {
      console.error("Error al obtener usuarios:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = async (userId, currentIsAdmin) => {
    const newRole = !currentIsAdmin;

    Swal.fire({
      title: "¿Estás seguro?",
      text: `¿Quieres cambiar el rol de este usuario a ${
        newRole ? "Administrador" : "Vendedor"
      }?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, cambiar rol",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getAuthToken();
          const response = await fetch(`${API_URL_USERS}/${userId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ isAdmin: newRole }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al actualizar el rol");
          }

          await response.json();
          Swal.fire(
            "¡Rol actualizado!",
            `El rol del usuario ha sido cambiado a ${
              newRole ? "Administrador" : "Vendedor"
            }.`,
            "success"
          );
          fetchUsers();
        } catch (err) {
          console.error("Error al actualizar rol:", err);
          Swal.fire(
            "Error",
            err.message || "Ocurrió un error al actualizar el rol del usuario.",
            "error"
          );
        }
      }
    });
  };

  const handleDeleteUser = async (userId) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto! El usuario será eliminado.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getAuthToken();
          const response = await fetch(`${API_URL_USERS}/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.message || "Error al eliminar el usuario"
            );
          }

          await response.json();
          Swal.fire(
            "¡Eliminado!",
            "El usuario ha sido eliminado correctamente.",
            "success"
          );
          fetchUsers();
        } catch (err) {
          console.error("Error al eliminar usuario:", err);
          Swal.fire(
            "Error",
            err.message || "Ocurrió un error al eliminar el usuario.",
            "error"
          );
        }
      }
    });
  };

  const handleNewUserChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewUserForm({
      ...newUserForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Quieres añadir este nuevo usuario?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, añadir",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = getAuthToken();
          const response = await fetch(API_URL_USERS, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(newUserForm),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al añadir el usuario");
          }

          await response.json();
          Swal.fire(
            "¡Usuario añadido!",
            "El nuevo usuario ha sido registrado correctamente.",
            "success"
          );
          setNewUserForm({
            fullname: "",
            email: "",
            password: "",
            isAdmin: false,
          });
          fetchUsers();
        } catch (err) {
          console.error("Error al añadir usuario:", err);
          Swal.fire(
            "Error",
            err.message || "Ocurrió un error al añadir el usuario.",
            "error"
          );
        }
      }
    });
  };

  if (loading) {
    return <div className="text-center mt-5">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center mt-5">Error: {error}</div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center">TU PERFIL</h2>
      {currentUser ? (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row mb-2">
              <div className="col-md-3 fw-bold">NOMBRE:</div>
              <div className="col-md-9">{currentUser.fullname}</div>
            </div>
            <div className="row mb-2">
              <div className="col-md-3 fw-bold">E-MAIL:</div>
              <div className="col-md-9">{currentUser.email}</div>
            </div>
            <div className="row">
              <div className="col-md-3 fw-bold">ROL:</div>
              <div className="col-md-9">
                {currentUser.isAdmin ? "ADMINISTRADOR" : "VENDEDOR"}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info text-center">
          Cargando tu perfil o no se pudo encontrar tu información de usuario.
        </div>
      )}

      <h2 className="mb-4 text-center">USUARIOS</h2>
      <div className="table-responsive mb-5">
        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th>NOMBRE</th>
              <th>E-MAIL</th>
              <th>ROL</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id}>
                  <td>{user.fullname}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? "ADMINISTRADOR" : "VENDEDOR"}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEditRole(user._id, user.isAdmin)}
                    >
                      EDITAR ROL
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      ELIMINAR
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">
                  No hay otros usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="mb-4 text-center">AÑADIR USUARIO</h2>
      <div className="card p-4 bg-dark text-white">
        <form onSubmit={handleAddUser}>
          <div className="mb-3">
            <label htmlFor="fullname" className="form-label">
              NOMBRE
            </label>
            <input
              type="text"
              className="form-control"
              id="fullname"
              name="fullname"
              value={newUserForm.fullname}
              onChange={handleNewUserChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              E-MAIL
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={newUserForm.email}
              onChange={handleNewUserChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              CONTRASEÑA
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={newUserForm.password}
              onChange={handleNewUserChange}
              required
            />
          </div>
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="isAdmin"
              name="isAdmin"
              checked={newUserForm.isAdmin}
              onChange={handleNewUserChange}
            />
            <label className="form-check-label" htmlFor="isAdmin">
              Es Administrador
            </label>
          </div>
          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-success me-2">
              AÑADIR
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() =>
                setNewUserForm({
                  fullname: "",
                  email: "",
                  password: "",
                  isAdmin: false,
                })
              }
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UsersView;
