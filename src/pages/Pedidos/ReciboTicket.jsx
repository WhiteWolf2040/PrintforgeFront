import React from "react";
import { X, Printer, Copy, Package, QrCode } from "lucide-react";
import "./Recibo.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const formatearFecha = (f) => {
  if (!f) return "No definida";
  const soloFecha = f.split("T")[0];
  return new Date(`${soloFecha}T00:00:00`).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function ReciboTicket({ pedido, onCerrar }) {
  if (!pedido) return null;

const folio = pedido.folio || `PF-${String(pedido.id_pedidos).padStart(3, "0")}`;
  const cot = pedido.cotizacion;

  const handleCopiarFolio = () => {
    navigator.clipboard?.writeText(folio).catch(() => {});
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-recibo" onClick={(e) => e.stopPropagation()}>
        <div className="recibo-header-modal">
          <span>Ticket de pedido</span>
          <div className="recibo-acciones-modal">
            <button className="recibo-btn" onClick={handleImprimir}>
              <Printer size={14} /> Imprimir
            </button>
            <button className="recibo-cerrar" onClick={onCerrar}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="recibo-contenido">
          <div className="recibo-encabezado">
            <Package className="recibo-icon-grande" />
            <h2>PrintForge</h2>
            <p className="recibo-lema">Impresión 3D a tu medida</p>
          </div>

          <div className="recibo-folio-section">
            <div className="folio-group">
              <span className="folio-label">Folio:</span>
              <span className="folio-valor">{folio}</span>
              <button className="btn-copy-small" onClick={handleCopiarFolio} title="Copiar folio">
                <Copy size={13} />
              </button>
            </div>
            <div className="fechas-group">
              <p>
                <span className="label">Creado:</span>
                {formatearFecha(pedido.created_at)}
              </p>
              <p>
                <span className="label">Entrega:</span>
                {formatearFecha(pedido.fecha_limite)}
              </p>
            </div>
          </div>

          <div className="recibo-cliente-section">
            <h3>Cliente</h3>
            <div className="cliente-grid">
              <p>
                <span>Nombre:</span>
                {pedido.cliente?.nombre || "Sin cliente asignado"}
              </p>
              <p>
                <span>Tel:</span>
                {pedido.cliente?.telefono || "—"}
              </p>
              <p>
                <span>Email:</span>
                {pedido.cliente?.email || "—"}
              </p>
              <p>
                <span>Estado:</span>
                Entregado
              </p>
            </div>
          </div>

          <div className="recibo-articulo-section">
            <h3>Detalle del pedido</h3>
            <table className="recibo-tabla">
              <thead>
                <tr>
                  <th>Descripción</th>
                  <th className="text-center">Filamento</th>
                  <th className="text-center">Color</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{pedido.descripcion || "Sin descripción"}</td>
                  <td className="text-center">{cot?.tipo_filamento || "—"}</td>
                  <td className="text-center">{cot?.color_filamento || "—"}</td>
                  <td className="text-right">{money(pedido.monto_total)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="recibo-desglose">
            <div className="desglose-fila subtotal">
              <span>Subtotal</span>
              <span>{money(pedido.monto_total)}</span>
            </div>
            <div className="desglose-fila total">
              <span>Total</span>
              <span>{money(pedido.monto_total)}</span>
            </div>
          </div>

          <div className="recibo-footer-modal">
            <div className="recibo-qr">
              <QrCode className="qr-icon" />
              <div>
                <small>Folio de verificación</small>
                <p className="qr-folio">{folio}</p>
              </div>
            </div>
            <div className="recibo-notas">
              <p>Gracias por tu compra.</p>
              <p className="recibo-garantia">Conserva este comprobante como respaldo de tu pedido.</p>
            </div>
          </div>

          <div className="recibo-sello">
            <p>Documento generado automáticamente por PrintForge</p>
            <p>{new Date().toLocaleString("es-MX")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}