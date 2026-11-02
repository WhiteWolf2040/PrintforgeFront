import React, { useEffect, useState } from "react";
import { authFetch } from "../../config/auth";
import "./Finanzas.css";

const money = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

const mesActual = () => new Date().toISOString().slice(0, 7); // "YYYY-MM"

export default function PagosGastos() {
  const [mes, setMes] = useState(mesActual());
  const [pagos, setPagos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const [dataPagos, dataResumen] = await Promise.all([
        authFetch(`/pagos?mes=${mes}`),
        authFetch(`/pagos/resumen?mes=${mes}`),
      ]);
      if (dataPagos.success) setPagos(dataPagos.data);
      if (dataResumen.success) setResumen(dataResumen.data);
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo cargar la información." });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes]);

  return (
    <div className="fin">
      <header className="fin-header">
        <h1 className="fin-title">Pagos y Gastos</h1>
        <input
          type="month"
          className="input fin-mes-input"
          value={mes}
          onChange={(e) => setMes(e.target.value)}
        />
      </header>

      {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}

      {resumen && (
        <div className="fin-resumen">
          <div className="fin-resumen-card ingreso">
            <span className="fin-resumen-label">Anticipos cobrados</span>
            <span className="fin-resumen-valor">{money(resumen.total_anticipos)}</span>
          </div>
          <div className="fin-resumen-card gasto">
            <span className="fin-resumen-label">Gastos del mes</span>
            <span className="fin-resumen-valor">{money(resumen.total_gastos)}</span>
          </div>
          <div className={`fin-resumen-card balance ${resumen.balance < 0 ? "negativo" : ""}`}>
            <span className="fin-resumen-label">Balance</span>
            <span className="fin-resumen-valor">{money(resumen.balance)}</span>
          </div>
        </div>
      )}

      <section className="fin-section">
        <h2 className="fin-section-title">Anticipos registrados</h2>

        {cargando && <p className="fin-vacio">Cargando...</p>}
        {!cargando && pagos.length === 0 && (
          <p className="fin-vacio">No hay anticipos registrados este mes.</p>
        )}

        {pagos.length > 0 && (
          <div className="fin-tabla-wrap">
            <table className="fin-tabla">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th className="text-right">Anticipo</th>
                  <th className="text-right">Total pedido</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago.id_pagos}>
                    <td>{pago.pedido?.folio || "—"}</td>
                    <td>{pago.pedido?.cliente?.nombre || "Sin cliente"}</td>
                    <td>{pago.fecha}</td>
                    <td className="capitalize">{pago.metodo_pago}</td>
                    <td className="text-right anticipo-monto">{money(pago.monto)}</td>
                    <td className="text-right">{money(pago.pedido?.monto_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}