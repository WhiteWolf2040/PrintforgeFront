// pages/Clientes.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../../config/auth";
import "./Clientes.css";

const VACIO = { nombre: "", telefono: "", email: "", notas: "" };

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const data = await authFetch("/clientes");
      if (data.success) setClientes(data.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar la lista de clientes." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditar = (cliente) => {
    setEditandoId(cliente.id_cliente);
    setForm({
      nombre: cliente.nombre || "",
      telefono: cliente.telefono || "",
      email: cliente.email || "",
      notas: cliente.notas || "",
    });
    setMensaje(null);
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setForm(VACIO);
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este cliente?")) return;

    try {
      const data = await authFetch(`/clientes/${id}`, { method: "DELETE" });
      if (data.success) {
        setClientes((prev) => prev.filter((c) => c.id_cliente !== id));
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo eliminar el cliente." });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nombre.trim()) {
      setMensaje({ tipo: "error", texto: "El nombre es obligatorio." });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const data = editandoId
        ? await authFetch(`/clientes/${editandoId}`, {
            method: "PUT",
            body: JSON.stringify(form),
          })
        : await authFetch("/clientes", {
            method: "POST",
            body: JSON.stringify(form),
          });

      if (data.success) {
        setMensaje({ tipo: "ok", texto: editandoId ? "Cliente actualizado." : "Cliente agregado." });
        setForm(VACIO);
        setEditandoId(null);
        cargarClientes();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo guardar." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="cli">
     

      <div className="cli-layout">
        {/* -------- FORMULARIO -------- */}
        <section className="cli-section cli-form-section">
          <h2 className="cli-section-title">
            {editandoId ? "Editar cliente" : "Nuevo cliente"}
          </h2>

          <form className="cli-form" onSubmit={handleSubmit}>
            <label>
              Nombre
              <input
                className="input"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Nombre completo"
              />
            </label>

            <label>
              Teléfono
              <input
                className="input"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </label>

            <label>
              Email
              <input
                className="input"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </label>

            <label>
              Notas
              <textarea
                className="input textarea"
                name="notas"
                value={form.notas}
                onChange={handleChange}
                placeholder="Preferencias, contexto, etc."
                rows={3}
              />
            </label>

            {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <div className="cli-form-botones">
              <button className="guardar-btn" type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Agregar cliente"}
              </button>
              {editandoId && (
                <button type="button" className="cancelar-btn" onClick={handleCancelarEdicion}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        {/* -------- LISTA -------- */}
        <section className="cli-section cli-lista-section">
          <h2 className="cli-section-title">
            {cargando ? "Cargando..." : `${clientes.length} cliente(s)`}
          </h2>

          {!cargando && clientes.length === 0 && (
            <p className="cli-vacio">Aún no tienes clientes registrados.</p>
          )}

          <div className="cli-lista">
            {clientes.map((c) => (
              <div className="cli-card" key={c.id_cliente}>
                <div className="cli-card-info">
                  <span className="cli-card-nombre">{c.nombre}</span>
                  <span className="cli-card-detalle">
                    {c.telefono || "sin teléfono"} · {c.email || "sin email"}
                  </span>
                  {c.notas && <span className="cli-card-notas">{c.notas}</span>}
                </div>
                <div className="cli-card-acciones">
                  <button onClick={() => handleEditar(c)}>Editar</button>
                  <button onClick={() => handleEliminar(c.id_cliente)} className="eliminar">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}