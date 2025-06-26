import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const AvailableView = () => {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [available, setAvailable] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newQuantity, setNewQuantity] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_URL = import.meta.env.VITE_BACKEND_URL + "/api/v1/motos";
  const token = sessionStorage.getItem("token");

  const fetchAvailable = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const availableData = data.data || [];
      const sortedAvailableData = availableData.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      setAvailable(sortedAvailableData);
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
      Swal.fire("Atención", "Debes completar ambos campos", "warning");
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
        Swal.fire("Error", data.message || "Error al cargar moto", "error");
        return;
      }

      setName("");
      setQuantity("");
      fetchAvailable();
      Swal.fire("Éxito", "Producto cargado correctamente", "success");
    } catch (error) {
      console.error("Error al cargar moto", error);
      Swal.fire("Error", "Hubo un problema al cargar el producto", "error");
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
    if (isNaN(newQuantity) || Number(newQuantity) < 0) {
      Swal.fire(
        "Atención",
        "Debe ingresar una cantidad válida (número no negativo).",
        "warning"
      );
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
        Swal.fire(
          "Error",
          data.message || "Error al actualizar cantidad",
          "error"
        );
        return;
      }

      setEditingId(null);
      setNewQuantity("");
      fetchAvailable();
      Swal.fire("Éxito", "Cantidad actualizada correctamente", "success");
    } catch (error) {
      console.error("Error al actualizar cantidad", error);
      Swal.fire(
        "Error",
        "Hubo un problema al actualizar la cantidad.",
        "error"
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewQuantity("");
  };

  const filteredAvailable = available.filter((moto) =>
    moto.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFilteredQuantity = filteredAvailable.reduce(
    (sum, moto) => sum + moto.quantity,
    0
  );

  return (
    <div className="container py-4 mt-4">
      <h2 className="text-center mb-4">CARGAR DISPONIBLE</h2>

      <form onSubmit={handleSubmit} className="p-4 mb-5 bg-dark text-white">
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
            <label className="form-label text-center">CANTIDAD</label>
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

      <hr className="my-4 mb-5" />

      <h3 className="text-center mb-3">DISPONIBLE</h3>
      <div className="mb-3">
        <label htmlFor="searchProduct" className="form-label">
          Buscar Producto / Moto:
        </label>
        <input
          type="text"
          id="searchProduct"
          className="form-control"
          placeholder="Escribe para buscar por nombre..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th className="bg-dark text-white">PRODUCTO / MOTO</th>
              <th className="text-center bg-dark text-white">CANTIDAD</th>
              <th className="text-center bg-dark text-white">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredAvailable.length > 0 ? (
              filteredAvailable.map((moto) => (
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
                  <td className="text-center">
                    {editingId === moto._id ? (
                      <>
                        <button
                          className="btn btn-sm btn-success me-2"
                          onClick={() => handleSaveQuantity(moto._id)}
                        >
                          Guardar
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={handleCancelEdit}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() =>
                            handleEditQuantity(moto._id, moto.quantity)
                          }
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(moto._id)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No hay productos que coincidan con la búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="total-available-summary mt-3 p-3 bg-light rounded text-center">
        <h4>Total de Unidades Disponibles: {totalFilteredQuantity}</h4>
      </div>
    </div>
  );
};

export default AvailableView;
