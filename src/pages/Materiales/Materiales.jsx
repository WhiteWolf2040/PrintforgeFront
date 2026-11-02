import React, { useEffect, useState } from "react";
import { ChevronDown, Package } from "lucide-react";
import { authFetch } from "../../config/auth";
import "./Materiales.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const hoy = () => new Date().toISOString().split("T")[0];

const TIPOS = ["PLA", "PLA+", "PETG", "ABS", "TPU", "Resina", "Otro"];

const VACIO_MATERIAL = {
  nombre: "",
  tipo: "PLA",
  color: "",
  peso_rollo_gramos: "1000",
};

const VACIO_COMPRA = { rollos: "1", costo_total: "", fecha: hoy(), actualizar_costo_gramo: true };

// Modal para agregar un nuevo color/tipo al inventario
function ModalNuevoMaterial({ onCancelar, onConfirmar, enviando, tipoPredefinido }) {
  const [form, setForm] = useState({
    ...VACIO_MATERIAL,
    tipo: tipoPredefinido || "PLA"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mat-modal-overlay" onClick={onCancelar}>
      <div className="mat-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="mat-modal-titulo">
          {tipoPredefinido ? `Agregar ${tipoPredefinido}` : "Nuevo material"}
        </h3>

        <label className="mat-campo">
          Nombre (para identificarlo internamente)
          <input className="input" name="nombre" placeholder="Ej. PLA Negro Creality" value={form.nombre} onChange={handleChange} />
        </label>

        {!tipoPredefinido && (
          <div className="campo-doble">
            <label className="mat-campo">
              Tipo
              <select className="input" name="tipo" value={form.tipo} onChange={handleChange}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="mat-campo">
              Color
              <input className="input" name="color" placeholder="Ej. Negro" value={form.color} onChange={handleChange} />
            </label>
          </div>
        )}

        {tipoPredefinido && (
          <label className="mat-campo">
            Color
            <input className="input" name="color" placeholder="Ej. Negro" value={form.color} onChange={handleChange} />
          </label>
        )}

        <div className="campo-doble">
          <label className="mat-campo">
            Costo del rollo (1 kg)
            <input className="input" name="costo_rollo" placeholder="Ej. 400" value={form.costo_rollo} onChange={handleChange} />
          </label>
          <label className="mat-campo">
            Peso por rollo (g)
            <input className="input" name="peso_rollo_gramos" value={form.peso_rollo_gramos} onChange={handleChange} />
          </label>
        </div>

        <div className="mat-modal-acciones">
          <button className="cancelar-btn" onClick={onCancelar} disabled={enviando}>Cancelar</button>
          <button
            className="guardar-btn"
            onClick={() => onConfirmar({ 
              ...form, 
              peso_rollo_gramos: Number(form.peso_rollo_gramos),
              tipo: tipoPredefinido || form.tipo
            })}
            disabled={enviando || !form.nombre.trim() || !form.color.trim()}
          >
            {enviando ? "Guardando..." : "Crear material"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal para registrar la compra de rollos
function ModalCompra({ material, onCancelar, onConfirmar, enviando }) {
  const [form, setForm] = useState(VACIO_COMPRA);

  return (
    <div className="mat-modal-overlay" onClick={onCancelar}>
      <div className="mat-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="mat-modal-titulo">Registrar compra</h3>
        <p className="mat-modal-subtitulo">{material.tipo} · {material.color}</p>

        <label className="mat-campo">
          Rollos comprados
          <input
            className="input"
            value={form.rollos}
            onChange={(e) => {
              const raw = e.target.value.replace(",", ".");
              if (!/^\d*\.?\d*$/.test(raw)) return;
              setForm((p) => ({ ...p, rollos: raw }));
            }}
          />
        </label>

        <label className="mat-campo">
          Costo total pagado
          <input
            className="input"
            placeholder="Ej. 380"
            value={form.costo_total}
            onChange={(e) => {
              const raw = e.target.value.replace(",", ".");
              if (!/^\d*\.?\d*$/.test(raw)) return;
              setForm((p) => ({ ...p, costo_total: raw }));
            }}
          />
        </label>

        <label className="mat-campo">
          Fecha
          <input type="date" className="input" value={form.fecha} onChange={(e) => setForm((p) => ({ ...p, fecha: e.target.value }))} />
        </label>

        <label className="mat-checkbox">
          <input
            type="checkbox"
            checked={form.actualizar_costo_gramo}
            onChange={(e) => setForm((p) => ({ ...p, actualizar_costo_gramo: e.target.checked }))}
          />
          Actualizar el costo por gramo con esta compra
        </label>

        <div className="mat-modal-acciones">
          <button className="cancelar-btn" onClick={onCancelar} disabled={enviando}>Cancelar</button>
          <button
            className="guardar-btn"
            onClick={() => onConfirmar({
              rollos: Number(form.rollos),
              costo_total: Number(form.costo_total),
              fecha: form.fecha,
              actualizar_costo_gramo: form.actualizar_costo_gramo,
            })}
            disabled={enviando || !form.rollos || !form.costo_total}
          >
            {enviando ? "Guardando..." : "Confirmar compra"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalAjusteStock({ material, onCancelar, onConfirmar, enviando }) {
  const [stock, setStock] = useState(String(material.stock_gramos));
  const [motivo, setMotivo] = useState("");

  return (
    <div className="mat-modal-overlay" onClick={onCancelar}>
      <div className="mat-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="mat-modal-titulo">Ajustar stock</h3>
        <p className="mat-modal-subtitulo">{material.tipo} · {material.color}</p>
        <p className="mat-modal-subtitulo">
          Esto NO genera un gasto, solo corrige la cantidad real que tienes.
        </p>

        <label className="mat-campo">
          Stock real (gramos)
          <input
            className="input"
            value={stock}
            onChange={(e) => {
              const raw = e.target.value.replace(",", ".");
              if (!/^\d*\.?\d*$/.test(raw)) return;
              setStock(raw);
            }}
          />
        </label>

        <label className="mat-campo">
          Motivo (opcional)
          <input
            className="input"
            placeholder="Ej. Se acabó / conteo físico"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
          />
        </label>

        <div className="mat-modal-acciones">
          <button className="cancelar-btn" onClick={onCancelar} disabled={enviando}>Cancelar</button>
          <button
            className="guardar-btn"
            onClick={() => onConfirmar({ stock_gramos: Number(stock), motivo })}
            disabled={enviando || stock === ""}
          >
            {enviando ? "Guardando..." : "Guardar ajuste"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalEliminarMaterial({ material, onCancelar, onConfirmar, enviando }) {
  return (
    <div className="mat-modal-overlay" onClick={onCancelar}>
      <div className="mat-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="mat-modal-titulo">Eliminar material</h3>
        <p className="mat-modal-subtitulo">
          ¿Estás seguro de eliminar <strong>{material.tipo} · {material.color}</strong>?
        </p>
        <p className="mat-modal-subtitulo" style={{ color: 'var(--danger)' }}>
          Esta acción no se puede deshacer.
        </p>
        <div className="mat-modal-acciones">
          <button className="cancelar-btn" onClick={onCancelar} disabled={enviando}>Cancelar</button>
          <button 
            className="guardar-btn eliminar-btn" 
            onClick={onConfirmar}
            disabled={enviando}
          >
            {enviando ? "Eliminando..." : "Eliminar material"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Materiales() {
  const [grupos, setGrupos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [expandido, setExpandido] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [mostrarNuevoEnCategoria, setMostrarNuevoEnCategoria] = useState(null);
  const [materialParaCompra, setMaterialParaCompra] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [materialParaAjuste, setMaterialParaAjuste] = useState(null);
  const [materialAEliminar, setMaterialAEliminar] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const data = await authFetch("/materiales");
      if (data.success) setGrupos(data.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar el inventario." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const handleCrearMaterial = async (payload) => {
    setEnviando(true);
    try {
      const data = await authFetch("/materiales", { method: "POST", body: JSON.stringify(payload) });
      if (data.success) {
        setMostrarNuevo(false);
        setMensaje({ tipo: "ok", texto: "Material creado." });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo crear." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  const handleCrearMaterialEnCategoria = async (payload, tipo) => {
    setEnviando(true);
    try {
      const data = await authFetch("/materiales", { 
        method: "POST", 
        body: JSON.stringify({ ...payload, tipo }) 
      });
      if (data.success) {
        setMostrarNuevoEnCategoria(null);
        setMensaje({ tipo: "ok", texto: `Material agregado a ${tipo}.` });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo crear." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  const handleAjustarStock = async (payload) => {
    if (!materialParaAjuste) return;
    setEnviando(true);
    try {
      const data = await authFetch(`/materiales/${materialParaAjuste.id_materiales}/stock`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setMaterialParaAjuste(null);
        setMensaje({ tipo: "ok", texto: "Stock actualizado." });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo ajustar." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  const handleRegistrarCompra = async (payload) => {
    if (!materialParaCompra) return;
    setEnviando(true);
    try {
      const data = await authFetch(`/materiales/${materialParaCompra.id_materiales}/compra`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.success) {
        setMaterialParaCompra(null);
        setMensaje({ tipo: "ok", texto: "Compra registrada y gasto creado." });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo registrar." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarMaterial = async (materialId) => {
    if (!window.confirm("¿Estás seguro de eliminar este material?")) return;
    setEnviando(true);
    try {
      const data = await authFetch(`/materiales/${materialId}`, { method: "DELETE" });
      if (data.success) {
        setMaterialAEliminar(null);
        setMensaje({ tipo: "ok", texto: "Material eliminado." });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo eliminar." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminarCategoria = async (tipo) => {
    if (!window.confirm(`¿Estás seguro de eliminar toda la categoría ${tipo}?`)) return;
    setEnviando(true);
    try {
      const data = await authFetch(`/materiales/categoria/${tipo}`, { method: "DELETE" });
      if (data.success) {
        setMensaje({ tipo: "ok", texto: `Categoría ${tipo} eliminada.` });
        cargar();
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo eliminar la categoría." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="mat">
      <header className="mat-header">
        <h1 className="mat-title">Materiales</h1>
        <button className="mat-nuevo-btn" onClick={() => setMostrarNuevo(true)}>+ Nuevo material</button>
      </header>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      {cargando && <p className="mat-vacio">Cargando inventario...</p>}
      {!cargando && grupos.length === 0 && <p className="mat-vacio">No hay materiales registrados todavía.</p>}

      <div className="mat-acordeon">
        {grupos.map((grupo) => {
          const abierto = expandido === grupo.tipo;
          return (
            <div className="mat-grupo" key={grupo.tipo}>
              <button className="mat-grupo-header" onClick={() => setExpandido(abierto ? null : grupo.tipo)}>
                <div className="mat-grupo-icono"><Package size={18} /></div>
                <div className="mat-grupo-info">
                  <span className="mat-grupo-tipo" style={{ color: 'white' }}>
                    {grupo.tipo}
                  </span>
                  <span className="mat-grupo-resumen">
                    {grupo.total_rollos} rollo(s) · {grupo.total_gramos.toLocaleString("es-MX")} g · {money(grupo.total_valor)}
                  </span>
                </div>
                <ChevronDown size={18} className={`mat-grupo-chevron ${abierto ? "abierto" : ""}`} />
              </button>

              {abierto && (
                <div className="mat-grupo-body">
                  <button 
                    className="mat-add-material-btn"
                    onClick={() => setMostrarNuevoEnCategoria(grupo.tipo)}
                  >
                    + Agregar {grupo.tipo}
                  </button>
                  
                  {grupo.colores.map((m) => (
                    <div className="mat-color-card" key={m.id_materiales}>
                      <div className="mat-color-info">
                        <span className="mat-color-nombre">{m.color}</span>
                        <span className="mat-color-meta">{m.nombre}</span>
                      </div>
                      <div className="mat-color-datos">
                        <div className="mat-color-dato">
                          <span className="mat-color-dato-label">Rollos</span>
                          <span className="mat-color-dato-valor">{m.rollos_disponibles}</span>
                        </div>
                        <div className="mat-color-dato">
                          <span className="mat-color-dato-label">Stock</span>
                          <span className="mat-color-dato-valor">{Number(m.stock_gramos).toLocaleString("es-MX")} g</span>
                        </div>
                        <div className="mat-color-dato">
                          <span className="mat-color-dato-label">$/g</span>
                          <span className="mat-color-dato-valor">{money(m.costo_por_gramo)}</span>
                        </div>
                        <div className="mat-color-dato">
                          <span className="mat-color-dato-label">Valor</span>
                          <span className="mat-color-dato-valor destacado">{money(m.valor_inventario)}</span>
                        </div>
                      </div>
                      <div className="mat-color-botones">
                        <button 
                          className="mat-color-btn eliminar" 
                          onClick={() => setMaterialAEliminar(m)}
                          title="Eliminar material"
                        >
                          ✕
                        </button>
                        <button 
                          className="mat-color-btn secundario" 
                          onClick={() => setMaterialParaAjuste(m)}
                        >
                          Editar stock
                        </button>
                        <button 
                          className="mat-color-btn" 
                          onClick={() => setMaterialParaCompra(m)}
                        >
                          + Compra
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {grupo.colores.length === 0 && (
                    <div className="mat-categoria-vacia">
                      <p>No hay materiales en esta categoría</p>
                      <button 
                        className="mat-eliminar-categoria-btn"
                        onClick={() => handleEliminarCategoria(grupo.tipo)}
                      >
                        Eliminar categoría {grupo.tipo}
                      </button>
                    </div>
                  )}
                  {grupo.colores.length > 0 && (
                    <button 
                      className="mat-eliminar-categoria-btn"
                      onClick={() => handleEliminarCategoria(grupo.tipo)}
                    >
                      Eliminar categoría {grupo.tipo}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {mostrarNuevo && (
        <ModalNuevoMaterial
          onCancelar={() => setMostrarNuevo(false)}
          onConfirmar={handleCrearMaterial}
          enviando={enviando}
        />
      )}

      {mostrarNuevoEnCategoria && (
        <ModalNuevoMaterial
          tipoPredefinido={mostrarNuevoEnCategoria}
          onCancelar={() => setMostrarNuevoEnCategoria(null)}
          onConfirmar={(payload) => handleCrearMaterialEnCategoria(payload, mostrarNuevoEnCategoria)}
          enviando={enviando}
        />
      )}

      {materialParaCompra && (
        <ModalCompra
          material={materialParaCompra}
          onCancelar={() => setMaterialParaCompra(null)}
          onConfirmar={handleRegistrarCompra}
          enviando={enviando}
        />
      )}

      {materialParaAjuste && (
        <ModalAjusteStock
          material={materialParaAjuste}
          onCancelar={() => setMaterialParaAjuste(null)}
          onConfirmar={handleAjustarStock}
          enviando={enviando}
        />
      )}

      {materialAEliminar && (
        <ModalEliminarMaterial
          material={materialAEliminar}
          onCancelar={() => setMaterialAEliminar(null)}
          onConfirmar={() => handleEliminarMaterial(materialAEliminar.id_materiales)}
          enviando={enviando}
        />
      )}
    </div>
  );
}