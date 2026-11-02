import React, { forwardRef } from "react";
import "./FormatoCotizacion.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const formatearFecha = (fecha) => {
  if (!fecha) return "";
  const d = typeof fecha === "string" ? new Date(fecha + "T00:00:00") : fecha;
  if (Number.isNaN(d.getTime())) return String(fecha);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

/**
 * Formato imprimible de cotización, estilo "PRINTFORGE 3D".
 * Se usa con un ref (forwardRef) para poder capturarlo con html2canvas
 * y convertirlo a PDF (ver generarPdfCotizacion.js).
 *
 * Props esperadas en `datos`:
 * {
 *   fecha, validezDias,
 *   clienteNombre, clienteContacto,
 *   negocioNombre, negocioContacto,
 *   descripcionProducto,
 *   cantidad, descripcionItem, precioUnitario, total,
 *   terminos: string[],
 *   responsable, telefono,
 * }
 */
const FormatoCotizacion = forwardRef(function FormatoCotizacion({ datos }, ref) {
  const {
    fecha,
    validezDias = 7,
    clienteNombre,
    clienteContacto,
    negocioNombre = "PRINTFORGE 3D",
    negocioContacto,
    descripcionProducto,
    cantidad = 1,
    descripcionItem,
    precioUnitario = 0,
    total = 0,
    terminos = [],
    responsable = "RESPONSABLE DE PRINTFORGE 3D",
    telefono,
  } = datos || {};

  return (
    <div className="fc-pagina" ref={ref}>
      <header className="fc-header">
        <div className="fc-logo">
          <svg viewBox="0 0 100 100" width="70" height="70">
            <circle cx="50" cy="50" r="48" fill="#c0392b" />
            <text
              x="50"
              y="58"
              textAnchor="middle"
              fontSize="30"
              fontWeight="bold"
              fill="#ffffff"
              fontFamily="Georgia, serif"
            >
              3D
            </text>
          </svg>
        </div>

        <div className="fc-header-derecha">
          <h1 className="fc-titulo">COTIZACIÓN</h1>
          <table className="fc-fecha-box">
            <tbody>
              <tr>
                <th>FECHA:</th>
              </tr>
              <tr>
                <td>{formatearFecha(fecha)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </header>

      <section className="fc-datos">
        <h2 className="fc-subtitulo">COTIZACIÓN PARA:</h2>
        <div className="fc-fila">
          <span>
            <strong>CLIENTE:</strong> {clienteNombre || "—"}
          </span>
          <span>
            <strong>CONTACTO:</strong> {clienteContacto || "—"}
          </span>
        </div>
        <div className="fc-fila">
          <span>
            <strong>NEGOCIO:</strong> {negocioNombre}
          </span>
          <span>
            <strong>CONTACTO:</strong> {negocioContacto || "—"}
          </span>
        </div>
      </section>

      <section className="fc-descripcion">
        <h2 className="fc-subtitulo">DESCRIPCIÓN DE PRODUCTO:</h2>
        <div className="fc-descripcion-caja">
          {descripcionProducto || "—"}
        </div>
      </section>

      <table className="fc-tabla">
        <thead>
          <tr>
            <th>CANTIDAD</th>
            <th>DESCRIPCIÓN</th>
            <th>PRECIO U.</th>
            <th>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{cantidad}</td>
            <td>{descripcionItem || descripcionProducto || "—"}</td>
            <td>{money(precioUnitario)}</td>
            <td>{money(total)}</td>
          </tr>
          {/* filas vacías para mantener la altura del formato, igual que el original */}
          <tr className="fc-fila-vacia">
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
          <tr className="fc-fila-vacia">
            <td>&nbsp;</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}></td>
            <th>Total</th>
            <td className="fc-total-monto">{money(total)}</td>
          </tr>
        </tfoot>
      </table>

      <p className="fc-vigencia">
        Esta cotización es válida para los próximos {validezDias} días
      </p>

      <section className="fc-terminos">
        <h2 className="fc-subtitulo">TÉRMINOS:</h2>
        <ul>
          {terminos.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>

      <p className="fc-responsable">{responsable}</p>

      <footer className="fc-footer">
        <span>{telefono}</span>
        <span>{negocioNombre}</span>
      </footer>
    </div>
  );
});

export default FormatoCotizacion;