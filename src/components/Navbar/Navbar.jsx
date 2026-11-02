// components/Navbar/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Radio, ChevronLeft } from "lucide-react";
import { getUsuario, logout } from "../../config/auth";
import "./Navbar.css";

/**
 * Navbar único para toda la app.
 */
export default function Navbar({ seccion, volverA = "/", acciones }) {
  const navigate = useNavigate();
  const usuario = getUsuario();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-izquierda">
        <Link to="/" className="navbar-marca">
          <span className="navbar-marca-icono">
            <Radio size={16} />
          </span>
          <span className="navbar-marca-nombre">PrintForge</span>
        </Link>

        {seccion && (
          <>
            <span className="navbar-separador">/</span>
            <Link to={volverA} className="navbar-seccion">
              {seccion}
            </Link>
          </>
        )}
      </div>

      <div className="navbar-derecha">
        {acciones && <div className="navbar-acciones">{acciones}</div>}

        <div className="navbar-usuario">
          <img
            className="navbar-avatar"
            src={usuario?.avatar_url || "/avatar-default.png"}
            alt=""
          />
          <span className="navbar-usuario-nombre">
            Hola, {usuario?.nombre?.split(" ")[0] || "de nuevo"}
          </span>
        </div>

        <button className="navbar-logout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

/**
 * Link de "volver" opcional para usar DENTRO del contenido de una página
 * (no en el navbar), por si alguna vista todavía necesita ese patrón,
 * por ejemplo arriba de un formulario. Mantiene el mismo look en todos lados.
 */
export function VolverLink({ to, children }) {
  return (
    <Link to={to} className="volver-link">
      <ChevronLeft size={16} />
      {children}
    </Link>
  );
}