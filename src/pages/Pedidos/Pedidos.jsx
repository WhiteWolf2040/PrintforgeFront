import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../config/auth";
import ReciboTicket from "./ReciboTicket";
import { ChevronDown } from "lucide-react";
import "./Pedidos.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const COLUMNAS = [
  { estado: "cotizado", titulo: "Cotizado" },
  { estado: "anticipo_pagado", titulo: "Anticipo pagado" },
  { estado: "en_produccion", titulo: "En producción" },
  { estado: "entregado", titulo: "Entregado" },
];

const ESTADOS = [...COLUMNAS.map((c) => c.estado), "cancelado"];
const estadoLabel = (v) => COLUMNAS.find((c) => c.estado === v)?.titulo || "Cancelado";
const finalizado = (estado) => estado === "entregado" || estado === "cancelado";

const tiempoRelativo = (fecha) => {
  if (!fecha) return "";
  const dias = Math.floor((Date.now() - new Date(fecha).getTime()) / 86400000);
  if (dias <= 0) return "Hoy";
  if (dias === 1) return "Ayer";
  return `Hace ${dias} días`;
};

const ordenarPorFecha = (items) =>
  [...items].sort((a, b) => {
    if (!a.fecha_limite && !b.fecha_limite) return 0;
    if (!a.fecha_limite) return 1;
    if (!b.fecha_limite) return -1;
    return new Date(a.fecha_limite) - new Date(b.fecha_limite);
  });

// Modal para capturar el monto del anticipo.
function ModalAnticipo({ montoTotal, onCancelar, onConfirmar, enviando }) {
  const hoy = new Date().toISOString().split("T")[0];
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoy);
  const [metodo, setMetodo] = useState("efectivo");
  const [notas, setNotas] = useState("");

  const montoValido = Number(monto) > 0 && Number(monto) <= montoTotal;

  return (
    <div className="ped-modal-overlay" onClick={onCancelar}>
      <div className="ped-modal ped-modal-anticipo" onClick={(e) => e.stopPropagation()}>
        <h3 className="ped-anticipo-titulo">Registrar anticipo</h3>
        <p className="ped-anticipo-subtitulo">
          Monto total del pedido: <strong>{money(montoTotal)}</strong>
        </p>

        <label className="ped-anticipo-campo">
          Monto del anticipo
          <input
            type="text"
            inputMode="decimal"
            className="input"
            placeholder="Ej. 200"
            value={monto}
            onChange={(e) => {
              const raw = e.target.value.replace(",", ".");
              if (!/^\d*\.?\d*$/.test(raw)) return;
              setMonto(raw);
            }}
            autoFocus
          />
        </label>

        <label className="ped-anticipo-campo">
          Fecha
          <input
            type="date"
            className="input"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </label>

        <label className="ped-anticipo-campo">
          Método de pago
          <select className="input" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
            <option value="otro">Otro</option>
          </select>
        </label>

        <label className="ped-anticipo-campo">
          Notas (opcional)
          <input
            className="input"
            placeholder="Ej. Depósito BBVA"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
          />
        </label>

        <div className="ped-modal-acciones">
          <button className="ped-btn-cancelar" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button
            className="ped-btn-ticket"
            onClick={() => onConfirmar({ monto: Number(monto), fecha, metodo_pago: metodo, notas })}
            disabled={enviando || !montoValido}
          >
            {enviando ? "Guardando..." : "Confirmar anticipo"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [verCancelados, setVerCancelados] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [pedidoParaTicket, setPedidoParaTicket] = useState(null);
  const [mostrarModalAnticipo, setMostrarModalAnticipo] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [expandido, setExpandido] = useState("cotizado"); 

  const navigate = useNavigate();

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const data = await authFetch("/pedidos");
      if (data.success) setPedidos(data.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar los pedidos." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return pedidos.filter((p) => {
      if (!q) return true;
      const folio = p.folio || `PF-${String(p.id_pedidos).padStart(3, "0")}`;
      return (
        (p.descripcion || "").toLowerCase().includes(q) ||
        (p.cliente?.nombre || "").toLowerCase().includes(q) ||
        folio.toLowerCase().includes(q)
      );
    });
  }, [pedidos, busqueda]);

  const columnas = useMemo(() => {
    const base = COLUMNAS.map((c) => ({
      ...c,
      items: ordenarPorFecha(filtrados.filter((p) => p.estado === c.estado)),
    }));
    if (verCancelados) {
      base.push({
        estado: "cancelado",
        titulo: "Cancelado",
        items: ordenarPorFecha(filtrados.filter((p) => p.estado === "cancelado")),
      });
    }
    return base;
  }, [filtrados, verCancelados]);

  const abrirModal = (pedido) => setPedidoSeleccionado(pedido);
  const cerrarModal = () => setPedidoSeleccionado(null);

  const actualizarPedidoEnLista = (actualizado) => {
    setPedidos((prev) => prev.map((p) => (p.id_pedidos === actualizado.id_pedidos ? actualizado : p)));
    setPedidoSeleccionado(actualizado);
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (!pedidoSeleccionado) return;

    // Si eligen "anticipo_pagado" y el pedido aún no tiene ningún anticipo registrado,
    // abrimos el modal para capturar el monto en vez de solo cambiar el estado.
    if (nuevoEstado === "anticipo_pagado" && pedidoSeleccionado.anticipo_total === 0) {
      setMostrarModalAnticipo(true);
      return;
    }

    setActualizando(true);
    try {
      const data = await authFetch(`/pedidos/${pedidoSeleccionado.id_pedidos}`, {
        method: "PATCH",
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      if (data.success) {
        if (nuevoEstado === "entregado") {
          setPedidoSeleccionado(null);
          setPedidoParaTicket(data.data);
          setPedidos((prev) => prev.map((p) => (p.id_pedidos === data.data.id_pedidos ? data.data : p)));
        } else {
          actualizarPedidoEnLista(data.data);
        }
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo actualizar el estado." });
    } finally {
      setActualizando(false);
    }
  };

  const handleConfirmarAnticipo = async (payload) => {
    if (!pedidoSeleccionado) return;
    setActualizando(true);
    try {
      const data = await authFetch(`/pedidos/${pedidoSeleccionado.id_pedidos}/anticipo`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (data.success) {
        actualizarPedidoEnLista(data.data);
        setMostrarModalAnticipo(false);
        setMensaje({ tipo: "ok", texto: "Anticipo registrado." });
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo registrar el anticipo." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setActualizando(false);
    }
  };

  const handleEliminar = async () => {
    if (!pedidoSeleccionado) return;
    if (!window.confirm("¿Eliminar este pedido definitivamente?")) return;
    try {
      const data = await authFetch(`/pedidos/${pedidoSeleccionado.id_pedidos}`, { method: "DELETE" });
      if (data.success) {
        setPedidos((prev) => prev.filter((p) => p.id_pedidos !== pedidoSeleccionado.id_pedidos));
        cerrarModal();
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo eliminar el pedido." });
    }
  };

  const handleCancelar = () => {
    if (!window.confirm("¿Cancelar este pedido?")) return;
    handleCambiarEstado("cancelado");
  };

  const handleVerTicket = (pedido) => {
    setPedidoSeleccionado(null);
    setPedidoParaTicket(pedido);
  };

  return (
    <div className="ped">
      <div className="ped-toolbar">
        <input
          className="ped-buscar"
          placeholder="Buscar pedido..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="ped-toggle-cancelados" onClick={() => setVerCancelados((v) => !v)}>
          {verCancelados ? "Ocultar cancelados" : "Ver cancelados"}
        </button>
        <button className="ped-nuevo-btn" onClick={() => navigate("/cotizaciones/pendientes")}>
          + Nuevo pedido
        </button>
      </div>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      {cargando && <p className="ped-vacio">Cargando pedidos...</p>}

      <div className="ped-acordeon">
  {columnas.map((col) => {
    const abierto = expandido === col.estado;
    return (
      <div className="ped-grupo" key={col.estado}>
        <button className="ped-grupo-header" onClick={() => setExpandido(abierto ? null : col.estado)}>
          <div className="ped-grupo-info">
            <span className="ped-grupo-titulo">{col.titulo}</span>
            <span className="ped-grupo-resumen">{col.items.length} pedido(s)</span>
          </div>
          <ChevronDown size={18} className={`ped-grupo-chevron ${abierto ? "abierto" : ""}`} />
        </button>

        {abierto && (
          <div className="ped-grupo-body">
            {col.items.map((p) => (
              <button
                key={p.id_pedidos}
                className={`ped-card ${finalizado(p.estado) ? "ped-card-oscuro" : ""}`}
                onClick={() => abrirModal(p)}
              >
                <div className="ped-card-top">
                  <span className="ped-card-codigo">{p.folio}</span>
                  <span className="ped-card-monto">{money(p.monto_total)}</span>
                </div>
                <span className="ped-card-cliente">{p.cliente?.nombre || "Sin cliente asignado"}</span>
                <span className="ped-card-desc">{p.descripcion || "Sin descripción"}</span>
                {p.anticipo_total > 0 && (
                  <span className="ped-card-anticipo">Anticipo: {money(p.anticipo_total)}</span>
                )}
                <div className="ped-card-bottom">
                  <span className="ped-card-tiempo">{tiempoRelativo(p.created_at)}</span>
                  {p.fecha_limite && (
                    <span className="ped-card-fecha">Entrega: {p.fecha_limite}</span>
                  )}
                </div>
              </button>
            ))}
            {col.items.length === 0 && <span className="ped-columna-vacio">Sin pedidos</span>}
          </div>
        )}
      </div>
    );
  })}
</div>
      {pedidoSeleccionado && (
        <div className="ped-modal-overlay" onClick={cerrarModal}>
          <div className="ped-modal ped-modal-detalle" onClick={(e) => e.stopPropagation()}>
            <button className="ped-modal-cerrar" onClick={cerrarModal}>×</button>

            <div className="ped-detalle-header">
              <span className="ped-modal-codigo">{pedidoSeleccionado.folio}</span>
              <h2>{pedidoSeleccionado.cliente?.nombre || "Sin cliente asignado"}</h2>
              <p className="ped-modal-desc">{pedidoSeleccionado.descripcion || "Sin descripción"}</p>
            </div>

            <div className="ped-detalle-seccion">
              <h4 className="ped-detalle-titulo">Pago</h4>
              <div className="ped-detalle-grid">
                <div className="ped-detalle-item">
                  <span className="ped-detalle-label">Total</span>
                  <span className="ped-detalle-valor destacado">{money(pedidoSeleccionado.monto_total)}</span>
                </div>
                <div className="ped-detalle-item">
                  <span className="ped-detalle-label">Anticipo</span>
                  <span className="ped-detalle-valor anticipo">{money(pedidoSeleccionado.anticipo_total)}</span>
                </div>
                <div className="ped-detalle-item">
                  <span className="ped-detalle-label">Saldo pendiente</span>
                  <span className="ped-detalle-valor">{money(pedidoSeleccionado.saldo_pendiente)}</span>
                </div>
              </div>

              {pedidoSeleccionado.anticipo_total === 0 && !finalizado(pedidoSeleccionado.estado) && (
                <button
                  type="button"
                  className="ped-btn-registrar-anticipo"
                  onClick={() => setMostrarModalAnticipo(true)}
                >
                  + Registrar anticipo
                </button>
              )}

              {pedidoSeleccionado.pagos?.length > 0 && (
                <div className="ped-detalle-pagos-lista">
                  {pedidoSeleccionado.pagos.map((pago) => (
                    <div className="ped-detalle-pago-item" key={pago.id_pagos}>
                      <span>{money(pago.monto)}</span>
                      <span className="ped-detalle-pago-meta">
                        {pago.fecha} · {pago.metodo_pago}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="ped-detalle-seccion">
              <h4 className="ped-detalle-titulo">Entrega</h4>
              <div className="ped-detalle-grid">
                <div className="ped-detalle-item">
                  <span className="ped-detalle-label">Fecha límite</span>
                  <span className="ped-detalle-valor">{pedidoSeleccionado.fecha_limite || "No definida"}</span>
                </div>
              </div>
            </div>

            {pedidoSeleccionado.cotizacion && (
              <div className="ped-detalle-seccion">
                <h4 className="ped-detalle-titulo">Producción</h4>
                <div className="ped-detalle-grid">
                  <div className="ped-detalle-item">
                    <span className="ped-detalle-label">Costo real</span>
                    <span className="ped-detalle-valor">{money(pedidoSeleccionado.cotizacion.costo_total)}</span>
                  </div>
                  <div className="ped-detalle-item">
                    <span className="ped-detalle-label">Utilidad</span>
                    <span className="ped-detalle-valor">{money(pedidoSeleccionado.cotizacion.utilidad)}</span>
                  </div>
                  <div className="ped-detalle-item">
                    <span className="ped-detalle-label">Filamento</span>
                    <span className="ped-detalle-valor">{pedidoSeleccionado.cotizacion.tipo_filamento || "—"}</span>
                  </div>
                  <div className="ped-detalle-item">
                    <span className="ped-detalle-label">Color</span>
                    <span className="ped-detalle-valor">{pedidoSeleccionado.cotizacion.color_filamento || "—"}</span>
                  </div>
                </div>
              </div>
            )}

            <label className="ped-modal-estado-label">
              Estado
              <select
                className="input"
                value={pedidoSeleccionado.estado}
                onChange={(e) => handleCambiarEstado(e.target.value)}
                disabled={actualizando}
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{estadoLabel(e)}</option>
                ))}
              </select>
            </label>

            <div className="ped-modal-acciones">
              {pedidoSeleccionado.estado === "entregado" && (
                <>
                  <button className="ped-btn-ticket" onClick={() => handleVerTicket(pedidoSeleccionado)}>
                    Ver ticket
                  </button>
                  <button className="ped-btn-eliminar" onClick={handleEliminar}>Eliminar pedido</button>
                </>
              )}
              {!finalizado(pedidoSeleccionado.estado) && (
                <button className="ped-btn-cancelar" onClick={handleCancelar}>Cancelar pedido</button>
              )}
            </div>
          </div>
        </div>
      )}

      {mostrarModalAnticipo && pedidoSeleccionado && (
        <ModalAnticipo
          montoTotal={pedidoSeleccionado.monto_total}
          onCancelar={() => setMostrarModalAnticipo(false)}
          onConfirmar={handleConfirmarAnticipo}
          enviando={actualizando}
        />
      )}

      {pedidoParaTicket && (
        <ReciboTicket pedido={pedidoParaTicket} onCerrar={() => setPedidoParaTicket(null)} />
      )}
    </div>
  );
}