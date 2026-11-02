// pages/Cotizaciones/CotizacionesPendientes.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authFetch } from "../../config/auth";
import ModalFormato from "../../components/Cotizaciones/ModalFormato";
import "./CotizacionesPendientes.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

// Arma los datos que autollenan el formato a partir de una cotización
// ya guardada en la BD (usa los montos que ya se calcularon en el backend).
function datosFormatoDesdeCotizacion(c) {
  const esGrande = c.tipo === "grande";
  const cantidad = esGrande ? Number(c.piezas_cantidad) || 1 : 1;
  const precioUnitario = esGrande
    ? Number(c.precio_por_pieza) || 0
    : Number(c.precio_final ?? c.precio_venta) || 0;
  const total = Number(c.precio_final ?? c.precio_venta) || 0;

  return {
    descripcionProducto: c.descripcion,
    descripcionItem: c.descripcion,
    clienteNombre: c.cliente?.nombre || "",
    cantidad,
    precioUnitario,
    total,
  };
}

// Desglose de detalle de una cotización (lo que no se ve en la tarjeta resumida).
function DetalleCotizacion({ c }) {
  return (
    <div className="cp-detalle">
      <div className="cp-detalle-grid">
        <span>Tipo: <strong>{c.tipo === "grande" ? "Servicio grande" : "Producción pequeña"}</strong></span>
        <span>Filamento: {c.filamento_gramos ?? 0} g × {money(c.filamento_costo_gramo)}</span>
        <span>Horas de luz: {c.horas_luz ?? 0} × {money(c.luz_costo_hora)}</span>
        <span>Desgaste: {money(c.desgaste_monto)}</span>
        <span>Tiempo de diseño: {money(c.tiempo_diseno_monto)}</span>
        <span>Argollas: {c.argollas_cantidad ?? 0} × {money(c.argollas_costo_unitario)}</span>
        <span>NFC: {c.nfc_cantidad ?? 0} × {money(c.nfc_costo_unitario)}</span>
        <span>Pintura: {c.pintura_cantidad ?? 0} × {money(c.pintura_costo_unitario)}</span>
        {c.tipo_filamento && <span>Filamento: {c.tipo_filamento} {c.color_filamento}</span>}
        <span>Costo total: <strong>{money(c.costo_total)}</strong></span>
        {c.tipo === "grande" && (
          <>
            <span>Piezas: {c.piezas_cantidad ?? 0}</span>
            <span>Descuento mayoreo: {c.descuento_mayoreo_pct ?? 0}%</span>
            <span>Precio por pieza: {money(c.precio_por_pieza)}</span>
          </>
        )}
        <span>Precio final: <strong>{money(c.precio_final ?? c.precio_venta)}</strong></span>
        <span>Utilidad: {money(c.utilidad)}</span>
      </div>
    </div>
  );
}

export default function CotizacionesPendientes() {
  const [pendientes, setPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [procesandoId, setProcesandoId] = useState(null);

  const [detalleAbiertoId, setDetalleAbiertoId] = useState(null);
  const [cotizacionParaFormato, setCotizacionParaFormato] = useState(null);

  const cargarPendientes = async () => {
    setCargando(true);
    try {
      const data = await authFetch("/cotizaciones/pendientes");
      if (data.success) setPendientes(data.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar las cotizaciones pendientes." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPendientes();
  }, []);

  const toggleDetalle = (id) => {
    setDetalleAbiertoId((actual) => (actual === id ? null : id));
  };

  // Al confirmar dentro del modal de formato, se crea el pedido (con fecha límite opcional).
  const handleConfirmarPedidoDesdeFormato = async ({ fechaLimite }) => {
    const cotizacion = cotizacionParaFormato;
    if (!cotizacion) return;

    setProcesandoId(cotizacion.id_cotizaciones);
    setMensaje(null);
    try {
      const data = await authFetch("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          cotizacion_id: cotizacion.id_cotizaciones,
          fecha_limite: fechaLimite || null,
        }),
      });
      if (data.success) {
        setMensaje({ tipo: "ok", texto: "Pedido creado a partir de la cotización." });
        setPendientes((prev) =>
          prev.filter((c) => c.id_cotizaciones !== cotizacion.id_cotizaciones)
        );
        setCotizacionParaFormato(null);
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo crear el pedido." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setProcesandoId(null);
    }
  };

  return (
    <div className="cp">
      <header className="cp-header">
        <div className="cp-header-left">
          <Link to="/" className="cp-back cp-back-panel">
            ← Panel
          </Link>
          <Link to="/cotizaciones" className="cp-back cp-back-cotizaciones">
            ← Cotizaciones
          </Link>
          <div>
            <h1 className="cp-title">Cotizaciones pendientes</h1>
            <p className="cp-subtitle">Guardadas, pero que aún no pasan a producción o pedido.</p>
          </div>
        </div>
        <Link to="/cotizaciones" className="cp-nueva-btn">+ Nueva cotización</Link>
      </header>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
      {cargando && <p className="cp-vacio">Cargando...</p>}
      {!cargando && pendientes.length === 0 && (
        <p className="cp-vacio">No tienes cotizaciones pendientes por ahora.</p>
      )}

      <div className="cp-grid">
        {pendientes.map((c) => (
          <div className="cp-card" key={c.id_cotizaciones}>
            <div className="cp-card-top">
              <span className="cp-card-desc">{c.descripcion || "Sin descripción"}</span>
              <span className="cp-card-monto">{money(c.precio_final ?? c.precio_venta)}</span>
            </div>
            <span className="cp-card-cliente">{c.cliente?.nombre || "Sin cliente asignado"}</span>

            <button className="cp-card-detalle-toggle" onClick={() => toggleDetalle(c.id_cotizaciones)}>
              {detalleAbiertoId === c.id_cotizaciones ? "Ocultar detalles ▲" : "Ver detalles ▼"}
            </button>
            {detalleAbiertoId === c.id_cotizaciones && <DetalleCotizacion c={c} />}

            <div className="cp-card-acciones">
              <button
                className="cp-card-btn cp-card-btn-secundario"
                onClick={() => setCotizacionParaFormato(c)}
              >
                Ver formato / pasar a pedido
              </button>
            </div>
          </div>
        ))}
      </div>

      {cotizacionParaFormato && (
        <ModalFormato
          datosBase={datosFormatoDesdeCotizacion(cotizacionParaFormato)}
          onCerrar={() => setCotizacionParaFormato(null)}
          onConfirmarPedido={handleConfirmarPedidoDesdeFormato}
          confirmando={procesandoId === cotizacionParaFormato.id_cotizaciones}
        />
      )}
    </div>
  );
}