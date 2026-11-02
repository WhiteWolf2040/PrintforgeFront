// components/Layout/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Navbar/Navbar";

/**
 * Envuelve cualquier ruta con el Navbar de arriba. 
 */
export default function Layout({ seccion, volverA, acciones }) {
  return (
    <div className="app-shell">
      <Navbar seccion={seccion} volverA={volverA} acciones={acciones} />
      <main className="app-contenido">
        <Outlet />
      </main>
    </div>
  );
}