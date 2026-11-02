import React, { useEffect, useState } from "react";
import { authFetch } from "../../config/auth";
import "./Finanzas.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const mesActual = () => new Date().toISOString().slice(0, 7);
const hoy = () => new Date().toISOString().split("T")[0];

const VACIO = { categoria: "mantenimiento", descripcion: "", monto: "", fecha: hoy() };

const CATEGORIAS = [
  { value: "material", label: "Material" },
  { value: "luz", label: "Luz" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "herramientas", label: "Herramientas" },
  { value: "publicidad", label: "Publicidad" },
  { value: "otro", label: "Otro" },
];

export default function GastosTaller() {
  const [mes, setMes] = useState(mesActual());
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [form, setForm] = useState(VACIO);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await authFetch(`/gastos?mes=${mes}`);
      if (data.success) setGastos(data.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar los gastos." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  const total = gastos.reduce((acc, g) => acc + Number(g.monto), 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.descripcion.trim() || !form.monto || Number(form.monto) <= 0) {
      setMensaje({ tipo: "error", texto: "Completa descripción y un monto válido." });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const data = await authFetch("/gastos", {
        method: "POST",
        body: JSON.stringify({ ...form, monto: Number(form.monto) }),
      });
      if (data.success) {
        setMensaje({ tipo: "ok", texto: "Gasto registrado." });
        setForm({ ...VACIO, fecha: hoy() });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo guardar." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      const data = await authFetch(`/gastos/${id}`, { method: "DELETE" });
      if (data.success) {
        setGastos((prev) => prev.filter((g) => g.id_gastos !== id));
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo eliminar el gasto." });
    }
  };

  return (
    <div className="fin">
      <header className="fin-header">
        <h1 className="fin-title">Gastos de Taller</h1>
        <input
          type="month"
          className="input fin-mes-input"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
      </header>

      <div className="fin-layout">
        <section className="fin-section fin-form-section">
          <h2 className="fin-section-title">Nuevo gasto</h2>

          <form className="fin-form" onSubmit={handleSubmit}>
            <label>
              Categoría
              <select className="input" name="categoria" value={form.categoria} onChange={handleChange}>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </label>

            <label>
              Descripción
              <input
                className="input"
                name="descripcion"
                placeholder="Ej. Boquilla nueva para la impresora"
                value={form.descripcion}
                onChange={handleChange}
              />
            </label>

            <div className="campo-doble">
              <label>
                Monto
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  name="monto"
                  placeholder="0.00"
                  value={form.monto}
                  onChange={(e) => {
                    const raw = e.target.value.replace(",", ".");
                    if (!/^\d*\.?\d*$/.test(raw)) return;
                    setForm((prev) => ({ ...prev, monto: raw }));
                  }}
                />
              </label>

              <label>
                Fecha
                <input type="date" className="input" name="fecha" value={form.fecha} onChange={handleChange} />
              </label>
            </div>

            {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

            <button className="guardar-btn" type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Registrar gasto"}
            </button>
          </form>
        </section>

        <section className="fin-section fin-lista-section">
          <div className="fin-lista-header">
            <h2 className="fin-section-title">{cargando ? "Cargando..." : `${gastos.length} gasto(s)`}</h2>
            <span className="fin-lista-total">Total: {money(total)}</span>
          </div>

          {!cargando && gastos.length === 0 && (
            <p className="fin-vacio">Sin gastos registrados este mes.</p>
          )}

          <div className="fin-gastos-lista">
            {gastos.map((g) => (
              <div className="fin-gasto-card" key={g.id_gastos}>
                <div className="fin-gasto-info">
                  <span className="fin-gasto-desc">{g.descripcion}</span>
                  <span className="fin-gasto-meta">{g.categoria} · {g.fecha}</span>
                </div>
                <div className="fin-gasto-acciones">
                  <span className="fin-gasto-monto">{money(g.monto)}</span>
                  <button onClick={() => handleEliminar(g.id_gastos)} className="eliminar">×</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}