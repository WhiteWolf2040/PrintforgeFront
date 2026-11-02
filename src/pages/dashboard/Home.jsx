// pages/dashboard/Home.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FileText, Package, TrendingUp, Database, Users, Sliders, Radio } from "lucide-react";
import { getUsuario, logout } from "../../config/auth";
import "./Home.css";

const MODULOS = [
  { nombre: "Cotizaciones", detalle: "Filamento, luz y margen de ganancia por pieza.", to: "/cotizaciones", icono: FileText, activo: true },
  { nombre: "Pedidos", detalle: "Estado de producción y entrega de piezas activas.", to: "/pedidos", icono: Package, activo: true },
  { nombre: "Pagos y Gastos", detalle: "Registro de anticipos, balance y gastos mensuales.", to: "/pagos-gastos", icono: TrendingUp, activo: true },
  { nombre: "Materiales", detalle: "Inventario de filamentos y costo por gramo.", icono: Database, activo: true, to: "/materiales" },
  { nombre: "Clientes", detalle: "Contactos, notas y preferencias de cada cliente.", to: "/clientes", icono: Users, activo: true },
  { nombre: "Gastos de Taller", detalle: "Mantenimiento, repuestos y amortización.", to: "/gastos-taller", icono: Sliders, activo: true },
   { nombre: "Cotizaciones Pendientes", detalle: "Cotizaciones que aún no han sido aprobadas.", to: "/cotizaciones/pendientes", icono: FileText, activo: true },
];

export default function Home() {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="home">
      <header className="home-topbar">
        <div className="home-brand">
          <span className="home-brand-icon"><Radio size={16} /></span>
          <span className="home-brand-nombre">PrintForge</span>
          <span className="home-brand-sep">/</span>
          <span className="home-brand-seccion">Panel Principal</span>
        </div>
        <div className="home-usuario">
          <span className="home-usuario-nombre">Hola, {usuario?.nombre?.split(" ")[0] || "de nuevo"}</span>
          <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>

      <main className="home-main">
        <h1 className="home-title">Panel de Control</h1>
        <p className="home-subtitle">Módulos del taller de impresión 3D</p>

        <div className="modulos-grid">
          {MODULOS.map((mod) => {
            const Icono = mod.icono;
            const contenido = (
              <>
                <div className="modulo-top">
                  <span className="modulo-icono"><Icono size={20} /></span>
                  <span className={`modulo-estado ${mod.activo ? "activo" : "pronto"}`}>
                    <span className="modulo-estado-dot" />
                    {mod.activo ? "Activo" : "Próximamente"}
                  </span>
                </div>
                <h2 className="modulo-nombre">{mod.nombre}</h2>
                <p className="modulo-detalle">{mod.detalle}</p>
              </>
            );

            return mod.activo && mod.to ? (
              <Link className="modulo-card" to={mod.to} key={mod.nombre}>{contenido}</Link>
            ) : (
              <div className="modulo-card disabled" key={mod.nombre}>{contenido}</div>
            );
          })}
        </div>
      </main>
    </div>
  );
}