import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";

import Login from "./components/Login";
import Home from "./pages/dashboard/Home";
import Cotizaciones from "./pages/Cotizaciones/Cotizaciones";
import Clientes from "./pages/Clientes/Clientes";
import Pedidos from "./pages/Pedidos/Pedidos";
import CotizacionesPendientes from "./pages/Cotizaciones/CotizacionesPendientes";
import PagosGastos from "./pages/Finanzas/PagosGastos";
import GastosTaller from "./pages/Finanzas/GastosTaller";
import Materiales from "./pages/Materiales/Materiales";
import Printforgelanding from "./components/Printforgelanding";


function App() {
  return (
    <Router>
      <Routes>

        {/* Pública */}
        <Route path="/login" element={<Login />} />

        {/* Privada */}
       <Route path="/home" element={<Home />} />

          
        <Route element={<Layout seccion="Cotizaciones" volverA="/" />}>
          <Route path="/cotizaciones" element={<Cotizaciones />} />
        </Route>
        
      <Route element={<Layout seccion="Clientes" volverA="/" />}>
        <Route path="/clientes" element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        } />
      </Route>

        <Route element={<Layout seccion="Seguimiento de Pedidos" volverA="/" />}>
          <Route path="/pedidos" element={<Pedidos />} />
        </Route>


     <Route element={<Layout seccion="Cotizaciones pendientes" volverA="/cotizaciones" />}>
        <Route path="/cotizaciones/pendientes" element={<CotizacionesPendientes />} />
      </Route>

      <Route element={<Layout seccion="Pagos y Gastos" volverA="/" />}>
          <Route path="/pagos-gastos" element={
                <ProtectedRoute>
                  <PagosGastos />
                </ProtectedRoute>
              } />
            </Route>

            <Route element={<Layout seccion="Gastos de Taller" volverA="/" />}>
              <Route path="/gastos-taller" element={
                <ProtectedRoute>
                  <GastosTaller />
                </ProtectedRoute>
              } />
            </Route>

            <Route element={<Layout seccion="Materiales" volverA="/" />}>
                <Route path="/materiales" element={
                  <ProtectedRoute>
                    <Materiales />
                  </ProtectedRoute>
                } />
              </Route>

              <Route path="/" element={<Printforgelanding />} />.


 



        {/*
         Crear lo de Clientes.jsx, Cotizaciones.jsx, etc.
          en src/pages/, agrega aquí su <Route> 

    
        */}

      </Routes>
    </Router>
  );
}

export default App;

 {/*   <Route path="/clientes" element={
          <ProtectedRoute>
            <Clientes />
          </ProtectedRoute>
        } />

        <Route path="/cotizaciones" element={
          <ProtectedRoute>
            <Cotizaciones />
          </ProtectedRoute>
        } />

        <Route path="/materiales" element={
          <ProtectedRoute>
            <Materiales />
          </ProtectedRoute>
        } />

        <Route path="/pedidos" element={
          <ProtectedRoute>
            <Pedidos />
          </ProtectedRoute>
        } />

        <Route path="/pagos" element={
          <ProtectedRoute>
            <Pagos />
          </ProtectedRoute>
        } />

        <Route path="/gastos" element={
          <ProtectedRoute>
            <Gastos />
          </ProtectedRoute>
        } /> */}

        