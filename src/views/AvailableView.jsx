import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const AvailableView = () => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [available, setAvailable] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL + "/api/v1/motos";
  const token = localStorage.getItem("token");

  const fetchAvailable = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const availableData = data.data || [];
      setAvailable(availableData);
    } catch (error) {
      console.error("Error al obtener disponibles", error);
      setAvailable([]);
    }
  };

  useEffect(() => {
    fetchAvailable();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !quantity) {
      alert("Debes completar ambos campos");
      return;
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, quantity: Number(quantity) }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al cargar moto");
        return;
      }

      setName("");
      setQuantity("");
      fetchAvailable();
    } catch (error) {
      console.error("Error al cargar moto", error);
    }
  };

  const handleCancel = () => {
    setName("");
    setQuantity("");
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¡Atención!",
      text: "¿Estás seguro que deseas eliminar este producto? Si tiene reservas activas, no podrás eliminarlo.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#28a745",
      cancelButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          Swal.fire("Error", data.message || "Error al eliminar moto", "error");
          return;
        }

        fetchAvailable();
        Swal.fire(
          "Eliminado",
          "El producto ha sido eliminado correctamente.",
          "success"
        );
      } catch (error) {
        console.error("Error al eliminar moto", error);
        Swal.fire(
          "Error",
          "Hubo un problema al eliminar el producto.",
          "error"
        );
      }
    }
  };

  const handleEditQuantity = (id, currentQuantity) => {
    setEditingId(id);
    setNewQuantity(currentQuantity);
  };

  const handleSaveQuantity = async (id) => {
    if (isNaN(newQuantity) || newQuantity < 0) {
      alert("Debe ingresar un número válido");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: Number(newQuantity) }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Error al actualizar cantidad");
        return;
      }

      setEditingId(null);
      setNewQuantity("");
      fetchAvailable();
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
    }
  };

  return (
    <div className="container py-4">
      <h3 className="text-center mb-4">CARGAR DISPONIBLE</h3>

      <form
        onSubmit={handleSubmit}
        className="p-4 mb-5"
        style={{ backgroundColor: "#111", color: "#fff" }}
      >
        <div className="row align-items-end">
          <div className="col-md-6 mb-3">
            <label className="form-label">PRODUCTO / MOTO</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="col-md-2 mb-3">
            <label className="form-label">CANTIDAD</label>
            <input
              type="number"
              className="form-control"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div className="col-md-4 mb-3 d-flex gap-2">
            <button type="submit" className="btn btn-success w-50">
              CARGAR
            </button>
            <button
              type="button"
              className="btn btn-danger w-50"
              onClick={handleCancel}
            >
              CANCELAR
            </button>
          </div>
        </div>
      </form>

      <hr />

      <h4 className="text-center mb-3">DISPONIBLE</h4>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>PRODUCTO / MOTO</th>
              <th className="text-center">CANTIDAD</th>
              <th className="text-end">ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {available &&
              available.map((moto) => (
                <tr key={moto._id}>
                  <td>{moto.name}</td>
                  <td className="text-center">
                    {editingId === moto._id ? (
                      <input
                        type="number"
                        className="form-control"
                        value={newQuantity}
                        onChange={(e) => setNewQuantity(e.target.value)}
                      />
                    ) : (
                      moto.quantity
                    )}
                  </td>
                  <td className="text-end">
                    {editingId === moto._id ? (
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleSaveQuantity(moto._id)}
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() =>
                          handleEditQuantity(moto._id, moto.quantity)
                        }
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(moto._id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            {available && available.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center">
                  No hay disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AvailableView;
