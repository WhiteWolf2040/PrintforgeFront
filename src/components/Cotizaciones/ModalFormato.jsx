import React, { useEffect, useRef, useState } from "react";
import FormatoCotizacion from "./FormatoCotizacion";
import { generarPdfDesdeElemento } from "../../utils/generarPdfCotizacion";
import "./ModalFormato.css";

const TERMINOS_DEFAULT = [
  "Se requiere 50% de anticipo para cualquier pedido a realizar, con tiempo mínimo de una semana de anticipación.",
  "El pago final se realiza al terminar y entregar el producto.",
  "El tiempo de entrega es dependiendo del tipo de trabajo a realizar.",
  "Cancelaciones reembolsables a partir de las primeras 24 horas de realizar el pedido o en caso de no entregar el producto por parte de la empresa.",
];

// Datos fijos del negocio. Ajusta aquí el contacto/teléfono por defecto.
const NEGOCIO_DEFAULT = {
  nombre: "PRINTFORGE 3D",
  contacto: "999-993-7698",
  telefonoFooter: "(999) 993 7698",
};

/**
 * Recibe `datosBase` ya calculados (cantidad, descripcionItem, precioUnitario, total, etc.)
 * y arma el estado editable del formato. Se usa tanto desde Cotizaciones.jsx (antes de guardar)
 * como desde CotizacionesPendientes.jsx (con datos ya guardados en la BD).
 *
 * Props:
 * - datosBase: { descripcionProducto, cantidad, descripcionItem, precioUnitario, total, clienteNombre }
 * - onCerrar: () => void
 * - onConfirmarPedido?: ({ fechaLimite }) => Promise<void> | void  (si se pasa, muestra el botón "Confirmar y crear pedido")
 * - confirmando?: boolean
 */
export default function ModalFormato({ datosBase, onCerrar, onConfirmarPedido, confirmando }) {
  const refFormato = useRef(null);
  const [descargando, setDescargando] = useState(false);

  const [clienteContacto, setClienteContacto] = useState("");
  const [negocioContacto, setNegocioContacto] = useState(NEGOCIO_DEFAULT.contacto);
  const [validezDias, setValidezDias] = useState(7);
  const [responsable, setResponsable] = useState("RESPONSABLE DE PRINTFORGE 3D");
  const [terminos, setTerminos] = useState(TERMINOS_DEFAULT.join("\n"));
  const [fechaLimite, setFechaLimite] = useState("");

  // fecha de hoy en formato YYYY-MM-DD, autollenada
  const [fecha] = useState(() => new Date().toISOString().split("T")[0]);
  const hoy = fecha;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const datosFormato = {
    fecha,
    validezDias,
    clienteNombre: datosBase?.clienteNombre,
    clienteContacto,
    negocioNombre: NEGOCIO_DEFAULT.nombre,
    negocioContacto,
    descripcionProducto: datosBase?.descripcionProducto,
    cantidad: datosBase?.cantidad ?? 1,
    descripcionItem: datosBase?.descripcionItem,
    precioUnitario: datosBase?.precioUnitario ?? 0,
    total: datosBase?.total ?? 0,
    terminos: terminos.split("\n").filter((linea) => linea.trim() !== ""),
    responsable,
    telefono: NEGOCIO_DEFAULT.telefonoFooter,
  };

  const handleDescargar = async () => {
    setDescargando(true);
    try {
      const nombre = `cotizacion_${(datosBase?.descripcionProducto || "printforge")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 40)}.pdf`;
      await generarPdfDesdeElemento(refFormato.current, nombre);
    } finally {
      setDescargando(false);
    }
  };

  const handleConfirmar = () => {
    if (onConfirmarPedido) onConfirmarPedido({ fechaLimite: fechaLimite || null });
  };

  return (
    <div className="mf-overlay" onClick={onCerrar}>
      <div className="mf-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mf-columna-editar">
          <h3 className="mf-titulo">Formato de cotización</h3>
          <p className="mf-ayuda">
            Estos datos se autollenan con lo capturado; puedes ajustarlos antes de
            descargar o de pasar a pedido.
          </p>

          <label className="mf-campo">
            Fecha
            <input className="input" type="text" value={hoy} disabled />
          </label>

          <label className="mf-campo">
            Contacto del cliente
            <input
              className="input"
              placeholder="Teléfono o correo del cliente"
              value={clienteContacto}
              onChange={(e) => setClienteContacto(e.target.value)}
            />
          </label>

          <label className="mf-campo">
            Contacto del negocio
            <input
              className="input"
              value={negocioContacto}
              onChange={(e) => setNegocioContacto(e.target.value)}
            />
          </label>

          <label className="mf-campo">
            Validez de la cotización (días)
            <input
              className="input"
              type="number"
              min="1"
              value={validezDias}
              onChange={(e) => setValidezDias(Number(e.target.value) || 0)}
            />
          </label>

          <label className="mf-campo">
            Responsable
            <input
              className="input"
              value={responsable}
              onChange={(e) => setResponsable(e.target.value)}
            />
          </label>

          <label className="mf-campo">
            Términos (uno por línea)
            <textarea
              className="input mf-textarea"
              rows={6}
              value={terminos}
              onChange={(e) => setTerminos(e.target.value)}
            />
          </label>

          {onConfirmarPedido && (
            <label className="mf-campo">
              Fecha límite de entrega (opcional)
              <input
                className="input"
                type="date"
                min={hoy}
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
              />
            </label>
          )}

          <div className="mf-acciones">
            <button className="cancelar-btn" onClick={onCerrar}>
              Cerrar
            </button>
            <button className="mf-btn-descargar" onClick={handleDescargar} disabled={descargando}>
              {descargando ? "Generando PDF..." : "Descargar PDF"}
            </button>
            {onConfirmarPedido && (
              <button className="pedido-btn" onClick={handleConfirmar} disabled={confirmando}>
                {confirmando ? "Creando pedido..." : "Confirmar y crear pedido"}
              </button>
            )}
          </div>
        </div>

        <div className="mf-columna-preview">
          <div className="fc-pagina-preview">
            <FormatoCotizacion ref={refFormato} datos={datosFormato} />
          </div>
        </div>
      </div>
    </div>
  );
}