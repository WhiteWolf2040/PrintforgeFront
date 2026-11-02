import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../config/auth";
import ModalFormato from "../../components/Cotizaciones/ModalFormato";
import "./Cotizaciones.css";

const money = (n) =>
  (Number.isFinite(n) ? n : 0).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });

// Campo numérico controlado: siempre usa punto como separador decimal,
// y se sincroniza si el valor cambia desde afuera (ej. al cambiar de tipo).
function NumberField({ label, value, onChange, ayuda }) {
  const [texto, setTexto] = useState(String(value));

  useEffect(() => {
    const actual = parseFloat(texto.replace(",", "."));
    if (actual !== value) setTexto(String(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(",", ".");
    if (!/^-?\d*\.?\d*$/.test(raw)) return;

    setTexto(raw);
    const num = parseFloat(raw);
    onChange(Number.isNaN(num) ? 0 : num);
  };

  return (
    <label>
      {label}
      <input
        type="text"
        inputMode="decimal"
        className="input"
        value={texto}
        onChange={handleChange}
      />
      {ayuda && <span className="campo-ayuda">{ayuda}</span>}
    </label>
  );
}

// Modal para elegir la fecha límite de entrega antes de crear el pedido.
function ModalFechaEntrega({ fecha, onFechaChange, onCancelar, onConfirmar, enviando }) {
  const hoy = new Date().toISOString().split("T")[0];

  return (
    <div className="cot-modal-overlay" onClick={onCancelar}>
      <div className="cot-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="cot-modal-titulo">Fecha límite de entrega</h3>
        <p className="cot-modal-subtitulo">
          ¿Para cuándo se compromete la entrega de este pedido? (opcional, la puedes poner después)
        </p>

        <label className="cot-modal-campo">
          Fecha límite
          <input
            type="date"
            className="input"
            min={hoy}
            value={fecha}
            onChange={(e) => onFechaChange(e.target.value)}
            autoFocus
          />
        </label>

        <div className="cot-modal-acciones">
          <button className="cancelar-btn" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button className="pedido-btn" onClick={onConfirmar} disabled={enviando}>
            {enviando ? "Creando pedido..." : "Confirmar y crear pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Valores por defecto de desgaste/tiempo de diseño según el tipo de trabajo.
const DEFAULTS_POR_TIPO = {
  pequeno: { desgaste: 2, tiempoDiseno: 3 },
  grande: { desgaste: 15, tiempoDiseno: 20 },
};

// A partir de cuántas piezas se activa el descuento por mayoreo (servicio grande).
const MINIMO_PIEZAS_MAYOREO = 10;

export default function Cotizaciones() {
  const [tipo, setTipo] = useState("pequeno");
  const [descripcion, setDescripcion] = useState("");

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState("");

  const [filamentoGramos, setFilamentoGramos] = useState(0);
  const [filamentoCostoGramo, setFilamentoCostoGramo] = useState(0.4);
  const [horasLuz, setHorasLuz] = useState(0);
  const [luzCostoHora, setLuzCostoHora] = useState(3);

  const [desgasteCantidad, setDesgasteCantidad] = useState(1);
  const [desgasteMontoBase, setDesgasteMontoBase] = useState(
    DEFAULTS_POR_TIPO.pequeno.desgaste
  );
  const [tiempoDisenoCantidad, setTiempoDisenoCantidad] = useState(1);
  const [tiempoDisenoMontoBase, setTiempoDisenoMontoBase] = useState(
    DEFAULTS_POR_TIPO.pequeno.tiempoDiseno
  );

  const [argollasCantidad, setArgollasCantidad] = useState(0);
  const [argollasCostoUnitario, setArgollasCostoUnitario] = useState(1.47);
  const [nfcCantidad, setNfcCantidad] = useState(0);
  const [nfcCostoUnitario, setNfcCostoUnitario] = useState(2.59);
  const [pinturaCantidad, setPinturaCantidad] = useState(0);
  const [pinturaCostoUnitario, setPinturaCostoUnitario] = useState(0.3);

  // Mayoreo: solo aplica para "Servicio grande", a partir de 10 piezas.
  const [piezasCantidad, setPiezasCantidad] = useState(10);
  const [descuentoMayoreoPct, setDescuentoMayoreoPct] = useState(10);

  // Margen y reparto fijos por el momento (ya no editables desde la UI).
  const MARGEN_GANANCIA = 2.3;
  const REPARTO_EMPRESA_PCT = 0.3;
  const REPARTO_DUENO_PCT = 0.3;
  const REPARTO_HONORARIOS_PCT = 0.4;

  const [tipoFilamento, setTipoFilamento] = useState("PLA");
  const [colorFilamento, setColorFilamento] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [cotizacionGuardadaId, setCotizacionGuardadaId] = useState(null);
  const [creandoPedido, setCreandoPedido] = useState(false);

  const [mostrarModalEntrega, setMostrarModalEntrega] = useState(false);
  const [fechaLimite, setFechaLimite] = useState("");

  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);

  const [tipoPrecio, setTipoPrecio] = useState("venta"); // "venta" | "sugerido" | "personalizado"
  const [precioPersonalizado, setPrecioPersonalizado] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    authFetch("/clientes")
      .then((data) => {
        if (data.success) setClientes(data.data);
      })
      .catch(() => {
        // Si falla, el selector simplemente queda vacío; no bloquea la cotización.
      });
  }, []);

  // Al cambiar entre "Producción pequeña" y "Servicio grande",
  // ajusta los valores por defecto de desgaste y tiempo de diseño.
  const handleCambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);
    const defaults = DEFAULTS_POR_TIPO[nuevoTipo];
    setDesgasteMontoBase(defaults.desgaste);
    setTiempoDisenoMontoBase(defaults.tiempoDiseno);
  };

  const calc = useMemo(() => {
    const costoFilamento = filamentoGramos * filamentoCostoGramo;
    const costoLuz = horasLuz * luzCostoHora;
    const costoDesgaste = desgasteCantidad * desgasteMontoBase;
    const costoTiempoDiseno = tiempoDisenoCantidad * tiempoDisenoMontoBase;
    const costoArgollas = argollasCantidad * argollasCostoUnitario;
    const costoNfc = nfcCantidad * nfcCostoUnitario;
    const costoPintura = pinturaCantidad * pinturaCostoUnitario;

    const costoTotal =
      costoFilamento +
      costoLuz +
      costoDesgaste +
      costoTiempoDiseno +
      costoArgollas +
      costoNfc +
      costoPintura;

    const precioVenta = costoTotal * MARGEN_GANANCIA;
    const precioSugerido = precioVenta * 1.1;
    const precioPersonalizadoNum = Number(precioPersonalizado) || 0;

    // El precio "activo" depende de cuál esté seleccionado.
    const precioSeleccionado =
      tipoPrecio === "sugerido"
        ? precioSugerido
        : tipoPrecio === "personalizado"
        ? precioPersonalizadoNum
        : precioVenta;

    // Descuento por mayoreo: solo para "Servicio grande" y a partir de
    // MINIMO_PIEZAS_MAYOREO piezas. Se aplica sobre el precio ya seleccionado.
    const piezasAplicaDescuento =
      tipo === "grande" && piezasCantidad >= MINIMO_PIEZAS_MAYOREO;
    const descuentoDecimal = piezasAplicaDescuento ? descuentoMayoreoPct / 100 : 0;
    const precioConDescuento = precioSeleccionado * (1 - descuentoDecimal);
    const ahorroMayoreo = precioSeleccionado - precioConDescuento;
    const precioPorPieza =
      tipo === "grande" && piezasCantidad > 0
        ? precioConDescuento / piezasCantidad
        : 0;

    // El precio que realmente se cobra (con o sin descuento aplicado).
    const precioFinalReal = piezasAplicaDescuento ? precioConDescuento : precioSeleccionado;

    // Utilidad y reparto se calculan sobre lo que realmente se cobra.
    const utilidad = precioFinalReal - costoTotal;

    const repartoEmpresaMonto = utilidad * REPARTO_EMPRESA_PCT;
    const repartoDuenoMonto = utilidad * REPARTO_DUENO_PCT;
    const repartoHonorariosMonto = utilidad * REPARTO_HONORARIOS_PCT;

    return {
      costoFilamento,
      costoLuz,
      costoDesgaste,
      costoTiempoDiseno,
      costoArgollas,
      costoNfc,
      costoPintura,
      costoTotal,
      precioVenta,
      precioSugerido,
      precioSeleccionado,
      piezasAplicaDescuento,
      precioConDescuento,
      ahorroMayoreo,
      precioPorPieza,
      precioFinalReal,
      utilidad,
      repartoEmpresaMonto,
      repartoDuenoMonto,
      repartoHonorariosMonto,
    };
  }, [
    tipo,
    filamentoGramos,
    filamentoCostoGramo,
    horasLuz,
    luzCostoHora,
    desgasteCantidad,
    desgasteMontoBase,
    tiempoDisenoCantidad,
    tiempoDisenoMontoBase,
    argollasCantidad,
    argollasCostoUnitario,
    nfcCantidad,
    nfcCostoUnitario,
    pinturaCantidad,
    pinturaCostoUnitario,
    tipoPrecio,
    precioPersonalizado,
    piezasCantidad,
    descuentoMayoreoPct,
  ]);

  const buildPayload = () => ({
    cliente_id: clienteId || null,
    descripcion,
    tipo,
    filamento_gramos: filamentoGramos,
    filamento_costo_gramo: filamentoCostoGramo,
    horas_luz: horasLuz,
    luz_costo_hora: luzCostoHora,
    desgaste_monto: calc.costoDesgaste,
    tiempo_diseno_monto: calc.costoTiempoDiseno,
    argollas_cantidad: argollasCantidad,
    argollas_costo_unitario: argollasCostoUnitario,
    nfc_cantidad: nfcCantidad,
    nfc_costo_unitario: nfcCostoUnitario,
    pintura_cantidad: pinturaCantidad,
    pintura_costo_unitario: pinturaCostoUnitario,
    margen_ganancia: MARGEN_GANANCIA,
    reparto_empresa_pct: REPARTO_EMPRESA_PCT,
    reparto_dueno_pct: REPARTO_DUENO_PCT,
    reparto_honorarios_pct: REPARTO_HONORARIOS_PCT,
    tipo_precio: tipoPrecio,
    precio_personalizado:
      tipoPrecio === "personalizado" ? Number(precioPersonalizado) || 0 : null,
    tipo_filamento: tipoFilamento || null,
    color_filamento: colorFilamento || null,
    // Mayoreo (solo tiene sentido para "grande"; en "pequeno" viaja en null/0)
    piezas_cantidad: tipo === "grande" ? piezasCantidad : null,
    descuento_mayoreo_pct: calc.piezasAplicaDescuento ? descuentoMayoreoPct : 0,
    precio_con_descuento: tipo === "grande" ? calc.precioConDescuento : null,
    precio_por_pieza: tipo === "grande" ? calc.precioPorPieza : null,
  });

  const precioPersonalizadoInvalido =
    tipoPrecio === "personalizado" &&
    (!precioPersonalizado || Number(precioPersonalizado) <= 0);

  const handleGuardar = async () => {
    if (precioPersonalizadoInvalido) {
      setMensaje({ tipo: "error", texto: "Ingresa un precio personalizado válido." });
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const data = await authFetch("/cotizaciones", {
        method: "POST",
        body: JSON.stringify(buildPayload()),
      });

      if (data.success) {
        setMensaje({ tipo: "ok", texto: "Cotización guardada." });
        setCotizacionGuardadaId(data.data.id_cotizaciones);
      } else {
        setMensaje({ tipo: "error", texto: data.message || "No se pudo guardar." });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setGuardando(false);
    }
  };

  const handleAbrirModalEntrega = () => {
    if (precioPersonalizadoInvalido) {
      setMensaje({ tipo: "error", texto: "Ingresa un precio personalizado válido." });
      return;
    }
    setMensaje(null);
    setMostrarModalEntrega(true);
  };

  const handleCerrarModalEntrega = () => {
    if (creandoPedido) return;
    setMostrarModalEntrega(false);
  };

  const handleConfirmarPedido = async () => {
    setCreandoPedido(true);
    setMensaje(null);

    try {
      let idCotizacion = cotizacionGuardadaId;

      if (!idCotizacion) {
        const dataCot = await authFetch("/cotizaciones", {
          method: "POST",
          body: JSON.stringify(buildPayload()),
        });
        if (!dataCot.success) {
          setMensaje({
            tipo: "error",
            texto: dataCot.message || "No se pudo guardar la cotización.",
          });
          return;
        }
        idCotizacion = dataCot.data.id_cotizaciones;
        setCotizacionGuardadaId(idCotizacion);
      }

      const dataPedido = await authFetch("/pedidos", {
        method: "POST",
        body: JSON.stringify({
          cotizacion_id: idCotizacion,
          fecha_limite: fechaLimite || null,
        }),
      });

      if (dataPedido.success) {
        setMensaje({ tipo: "ok", texto: "Pedido creado a partir de la cotización." });
        setMostrarModalEntrega(false);
        setFechaLimite("");
      } else {
        setMensaje({
          tipo: "error",
          texto: dataPedido.message || "No se pudo crear el pedido.",
        });
      }
    } catch (error) {
      setMensaje({ tipo: "error", texto: "No se pudo conectar con el servidor." });
    } finally {
      setCreandoPedido(false);
    }
  };

  // Datos ya autollenados para el formato, tomados directo de lo capturado
  // y del cálculo en vivo (calc). El usuario los puede ajustar dentro del modal.
  const clienteSeleccionado = clientes.find(
    (c) => String(c.id_cliente) === String(clienteId)
  );

  const datosFormato = {
    descripcionProducto: descripcion,
    descripcionItem: descripcion,
    clienteNombre: clienteSeleccionado?.nombre || "",
    cantidad: tipo === "grande" ? piezasCantidad : 1,
    precioUnitario: tipo === "grande" ? calc.precioPorPieza : calc.precioFinalReal,
    total: calc.precioFinalReal,
  };

  return (
    <div className="cot">
      <header className="cot-header">
        <div>
          <h1 className="cot-title">Nueva cotización</h1>
          <p className="cot-subtitle">
            Llena los datos de producción y aquí abajo verás al instante cuánto cuesta
            hacerlo y cuánto conviene cobrar.
          </p>
        </div>

        <div className="cot-tipo">
          <button
            className={tipo === "pequeno" ? "tipo-btn active" : "tipo-btn"}
            onClick={() => handleCambiarTipo("pequeno")}
          >
             Producción pequeña
          </button>
          <button
            className={tipo === "grande" ? "tipo-btn active" : "tipo-btn"}
            onClick={() => handleCambiarTipo("grande")}
          >
             Servicio grande
          </button>
        </div>
      </header>

      <div className="cot-layout">
        <div className="cot-form">
          <section className="cot-section">
            <h2 className="cot-section-title">Cliente y descripción</h2>
            <p className="cot-section-help">¿Para quién es y qué es lo que se va a hacer?</p>

            <div className="campo-doble">
              <label>
                Cliente
                <select
                  className="input"
                  value={clienteId}
                  onChange={(e) => setClienteId(e.target.value)}
                >
                  <option value="">Sin cliente asignado</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Descripción
                <input
                  className="input"
                  placeholder="Ej. Llavero personalizado"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                />
              </label>
            </div>

            <button
              type="button"
              className="tipo-btn"
              onClick={() => navigate("/cotizaciones/pendientes")}
            >
              Ver cotizaciones pendientes
            </button>
          </section>

          <section className="cot-section">
            <h2 className="cot-section-title">Producción</h2>
            <p className="cot-section-help">
              Lo que gastamos en material, luz y tiempo para hacerlo.
            </p>

            <div className="campo-doble">
              <NumberField
                label="Filamento usado (g)"
                value={filamentoGramos}
                onChange={setFilamentoGramos}
              />
              <NumberField
                label="Costo por gramo"
                value={filamentoCostoGramo}
                onChange={setFilamentoCostoGramo}
              />
            </div>

            <div className="campo-doble">
              <NumberField label="Horas de luz" value={horasLuz} onChange={setHorasLuz} />
              <NumberField
                label="Costo por hora"
                value={luzCostoHora}
                onChange={setLuzCostoHora}
              />
            </div>

            <div className="campo-doble">
              <NumberField
                label="Cantidad"
                value={desgasteCantidad}
                onChange={setDesgasteCantidad}
              />
              <NumberField
                label="Desgaste/fallas (monto)"
                value={desgasteMontoBase}
                onChange={setDesgasteMontoBase}
                ayuda="Lo que se pierde en piezas fallidas o desgaste de la impresora"
              />
            </div>

            <div className="campo-doble">
              <NumberField
                label="Cantidad"
                value={tiempoDisenoCantidad}
                onChange={setTiempoDisenoCantidad}
              />
              <NumberField
                label="Tiempo de diseño (monto)"
                value={tiempoDisenoMontoBase}
                onChange={setTiempoDisenoMontoBase}
                ayuda="Lo que vale el tiempo invertido en diseñar el modelo"
              />
            </div>
          </section>

          <section className="cot-section">
            <h2 className="cot-section-title"> Extras</h2>
            <p className="cot-section-help">Materiales adicionales que no son filamento.</p>

            <div className="campo-doble">
              <NumberField
                label="Argollas (cant.)"
                value={argollasCantidad}
                onChange={setArgollasCantidad}
              />
              <NumberField
                label="Costo unitario"
                value={argollasCostoUnitario}
                onChange={setArgollasCostoUnitario}
              />
            </div>

            <div className="campo-doble">
              <NumberField
                label="NFC (cant.)"
                value={nfcCantidad}
                onChange={setNfcCantidad}
              />
              <NumberField
                label="Costo unitario"
                value={nfcCostoUnitario}
                onChange={setNfcCostoUnitario}
              />
            </div>

            <div className="campo-doble">
              <NumberField
                label="Pintura (cant.)"
                value={pinturaCantidad}
                onChange={setPinturaCantidad}
              />
              <NumberField
                label="Costo unitario"
                value={pinturaCostoUnitario}
                onChange={setPinturaCostoUnitario}
              />
            </div>
          </section>

          {tipo === "grande" && (
            <section className="cot-section cot-section-mayoreo">
              <h2 className="cot-section-title">📦 Piezas y descuento por mayoreo</h2>
              <p className="cot-section-help">
                A partir de {MINIMO_PIEZAS_MAYOREO} piezas se aplica un descuento
                automático y se calcula cuánto queda cada pieza.
              </p>

              <div className="campo-doble">
                <NumberField
                  label="Cantidad de piezas"
                  value={piezasCantidad}
                  onChange={setPiezasCantidad}
                />
                <NumberField
                  label="Descuento por mayoreo (%)"
                  value={descuentoMayoreoPct}
                  onChange={setDescuentoMayoreoPct}
                  ayuda={`Solo se aplica si hay ${MINIMO_PIEZAS_MAYOREO} piezas o más`}
                />
              </div>

              {calc.piezasAplicaDescuento ? (
                <span className="cot-badge-mayoreo cot-badge-on">
                  ✅ Descuento de {descuentoMayoreoPct}% aplicado
                </span>
              ) : (
                <span className="cot-badge-mayoreo cot-badge-off">
                  Sin descuento — faltan{" "}
                  {Math.max(0, MINIMO_PIEZAS_MAYOREO - piezasCantidad)} piezas para
                  activarlo
                </span>
              )}
            </section>
          )}

          <section className="cot-section">
            <h2 className="cot-section-title"> Material</h2>
            <p className="cot-section-help">Con qué y de qué color se va a imprimir.</p>

            <div className="campo-doble">
              <label>
                Tipo de filamento
                <select
                  className="input"
                  value={tipoFilamento}
                  onChange={(e) => setTipoFilamento(e.target.value)}
                >
                  <option value="PLA">PLA</option>
                  <option value="PLA+">PLA+</option>
                  <option value="PETG">PETG</option>
                  <option value="ABS">ABS</option>
                  <option value="TPU">TPU</option>
                  <option value="Resina">Resina</option>
                  <option value="Otro">Otro</option>
                </select>
              </label>

              <label>
                Color
                <input
                  className="input"
                  placeholder="Ej. Negro, Rojo, Transparente..."
                  value={colorFilamento}
                  onChange={(e) => setColorFilamento(e.target.value)}
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="cot-resultado">
          <div className="resultado-card costo">
            <span className="resultado-label"> Precio real (lo que nos cuesta)</span>
            <span className="resultado-valor">{money(calc.costoTotal)}</span>
            <div className="resultado-desglose">
              <span>Filamento: {money(calc.costoFilamento)}</span>
              <span>Luz: {money(calc.costoLuz)}</span>
              <span>Desgaste: {money(calc.costoDesgaste)}</span>
              <span>Tiempo de diseño: {money(calc.costoTiempoDiseno)}</span>
              <span>Argollas: {money(calc.costoArgollas)}</span>
              <span>NFC: {money(calc.costoNfc)}</span>
              <span>Pintura: {money(calc.costoPintura)}</span>
            </div>
          </div>

          <button
            type="button"
            className={`resultado-card venta seleccionable ${tipoPrecio === "venta" ? "seleccionado" : ""}`}
            onClick={() => setTipoPrecio("venta")}
          >
            <span className="resultado-label"> Precio de venta</span>
            <span className="resultado-valor" style={{ color: calc.utilidad < 0 ? 'white' : 'white' }}>
              {money(calc.precioVenta)}
            </span>
            <span className="resultado-nota">Costo × {MARGEN_GANANCIA}</span>
          </button>

          <button
            type="button"
            className={`resultado-card sugerido seleccionable ${tipoPrecio === "sugerido" ? "seleccionado" : ""}`}
            onClick={() => setTipoPrecio("sugerido")}
          >
            <span className="resultado-label"> Precio sugerido (+10%)</span>
            <span className="resultado-valor">{money(calc.precioSugerido)}</span>
            <span className="resultado-nota">Colchón extra sobre el precio de venta</span>
          </button>

          <div
            className={`resultado-card personalizado seleccionable ${tipoPrecio === "personalizado" ? "seleccionado" : ""}`}
            onClick={() => setTipoPrecio("personalizado")}
          >
            <span className="resultado-label"> Precio personalizado</span>
            <input
              type="text"
              inputMode="decimal"
              className="input precio-personalizado-input"
              placeholder={`Ej. ${Math.round(calc.precioVenta)}`}
              value={precioPersonalizado}
              onClick={(e) => e.stopPropagation()}
              onFocus={() => setTipoPrecio("personalizado")}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".");
                if (!/^\d*\.?\d*$/.test(raw)) return;
                setPrecioPersonalizado(raw);
              }}
            />
            <span className="resultado-nota">
              Referencia: venta {money(calc.precioVenta)} · sugerido {money(calc.precioSugerido)}
            </span>
          </div>

          {tipo === "grande" && calc.piezasAplicaDescuento && (
            <div className="resultado-card mayoreo">
              <span className="resultado-label"> Con descuento por mayoreo</span>
              <span className="resultado-valor">{money(calc.precioConDescuento)}</span>
              <span className="resultado-nota">
                Ahorro de {money(calc.ahorroMayoreo)} sobre el precio sin descuento
              </span>
              <div className="resultado-desglose resultado-pieza">
                <span>
                  Precio por pieza ({piezasCantidad} piezas):{" "}
                  <strong>{money(calc.precioPorPieza)}</strong>
                </span>
              </div>
            </div>
          )}

          <div className="resultado-card utilidad">
            <span className="resultado-label">Utilidad</span>
            <span className="resultado-valor" style={{ color: calc.utilidad < 0 ? 'red' : 'green' }}>
              {money(calc.utilidad)}
            </span>
            <span className="resultado-nota">
              Sobre lo que se cobra realmente ({money(calc.precioFinalReal)}
              {calc.piezasAplicaDescuento ? ", ya con descuento de mayoreo" : ""})
            </span>
            <div className="resultado-desglose">
              <span>Empresa: {money(calc.repartoEmpresaMonto)}</span>
              <span>Dueño: {money(calc.repartoDuenoMonto)}</span>
              <span>Honorarios: {money(calc.repartoHonorariosMonto)}</span>
            </div>
          </div>

          {mensaje && <div className={`mensaje ${mensaje.tipo}`}>{mensaje.texto}</div>}
          <div className="cot-botones">
            <button
              type="button"
              className="tipo-btn"
              onClick={() => setMostrarModalFormato(true)}
            >
              Ver / descargar formato
            </button>
            <button className="guardar-btn" onClick={handleGuardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar cotización"}
            </button>
            <button
              className="pedido-btn"
              onClick={handleAbrirModalEntrega}
              disabled={creandoPedido}
            >
              Pasar a pedido
            </button>
          </div>
        </aside>
      </div>

      {mostrarModalEntrega && (
        <ModalFechaEntrega
          fecha={fechaLimite}
          onFechaChange={setFechaLimite}
          onCancelar={handleCerrarModalEntrega}
          onConfirmar={handleConfirmarPedido}
          enviando={creandoPedido}
        />
      )}

      {mostrarModalFormato && (
        <ModalFormato
          datosBase={datosFormato}
          onCerrar={() => setMostrarModalFormato(false)}
        />
      )}
    </div>
  );
}