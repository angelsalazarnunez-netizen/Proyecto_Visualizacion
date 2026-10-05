import { Navigate, Outlet } from "react-router-dom";

import { obtenerSesion } from "../../servicios/Srv_SIM_Autenticacion.js";

function Cmp_SIM_RutaProtegida() {
  return obtenerSesion()?.token
    ? <Outlet />
    : <Navigate to="/login" replace />;
}

export default Cmp_SIM_RutaProtegida;
