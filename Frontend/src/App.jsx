import { Navigate, Route, Routes } from "react-router-dom";

import Cmp_SIM_RutaProtegida from "./componentes/seguridad/Cmp_SIM_RutaProtegida.jsx";
import Frm_SIM_IniciarSesion from "./pages/seguridad/Frm_SIM_IniciarSesion.jsx";
import Frm_SIM_RegistrarDesalmacenaje from "./pages/tramites/Frm_SIM_RegistrarDesalmacenaje.jsx";
import Frm_SIM_Expediente from "./pages/tramites/Frm_SIM_Expediente.jsx";
import Frm_SIM_DocumentacionDesalmacenaje from "./pages/tramites/Frm_SIM_DocumentacionDesalmacenaje.jsx";
import Lst_SIM_Expedientes from "./pages/tramites/Lst_SIM_Expedientes.jsx";
import Frm_SIM_RegistrarExoneracion from "./pages/tramites/Frm_SIM_RegistrarExoneracion.jsx";
import Frm_SIM_ExpedienteExoneracion from "./pages/tramites/Frm_SIM_ExpedienteExoneracion.jsx";
import Frm_SIM_ObservacionesExoneracion from "./pages/tramites/Frm_SIM_ObservacionesExoneracion.jsx";
import Frm_SIM_RegistrarImportacion from "./pages/tramites/Frm_SIM_RegistrarImportacion.jsx";
import Lst_SIM_Importaciones from "./pages/tramites/Lst_SIM_Importaciones.jsx";
import Lst_SIM_BuscarTramites from "./pages/tramites/Lst_SIM_BuscarTramites.jsx";
import Frm_SIM_ReporteConsultas from "./pages/reportes/Frm_SIM_ReporteConsultas.jsx";
import Frm_SIM_Menu from "./pages/tramites/Frm_SIM_Menu.jsx";
import Frm_SIM_RegistrarDonacion from "./pages/tramites/Frm_SIM_RegistrarDonacion.jsx";
import Lst_SIM_Donaciones from "./pages/tramites/Lst_SIM_Donaciones.jsx";
import Frm_SIM_ExpedienteDonacion from "./pages/tramites/Frm_SIM_ExpedienteDonacion.jsx";
import Frm_SIM_AlertasTemporales from "./pages/tramites/Frm_SIM_AlertasTemporales.jsx";
import Lst_SIM_TramitesTemporales from "./pages/tramites/Lst_SIM_TramitesTemporales.jsx";
import Frm_SIM_RegistrarTramiteTemporal from "./pages/tramites/Frm_SIM_RegistrarTramiteTemporal.jsx";
import Frm_SIM_ExpedienteTramiteTemporal from "./pages/tramites/Frm_SIM_ExpedienteTramiteTemporal.jsx";
import Frm_SIM_RevisarDocumentacionExoneracion from "./pages/tramites/Frm_SIM_RevisarDocumentacionExoneracion.jsx";
import Frm_SIM_ControlDocumentalExoneracion from "./pages/tramites/Frm_SIM_ControlDocumentalExoneracion.jsx";
import Frm_SIM_AprobarExoneracion from "./pages/tramites/Frm_SIM_AprobarExoneracion.jsx";
import Lst_SIM_AprobacionesExoneracion from "./pages/tramites/Lst_SIM_AprobacionesExoneracion.jsx";
import Lst_SIM_TramitesActivos from "./pages/tramites/Lst_SIM_TramitesActivos.jsx";
import Frm_SIM_AutorizacionExonet from "./pages/tramites/Frm_SIM_AutorizacionExonet.jsx";
import Frm_SIM_RegistrarUsuario from "./pages/seguridad/Frm_SIM_RegistrarUsuario.jsx";
import Frm_SIM_VerificarCuenta from "./pages/seguridad/Frm_SIM_VerificarCuenta.jsx";
import Frm_SIM_GestionarRoles from "./pages/seguridad/Frm_SIM_GestionarRoles.jsx";
import Frm_SIM_AsignarRoles from "./pages/seguridad/Frm_SIM_AsignarRoles.jsx";

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 26/09/2026
 * Descripción: Rutas del módulo de trámites: registro del desalmacenaje especial (HU-031),
 *   seguimiento de su expediente (HU-032), gestión de su documentación (HU-045), registro
 *   de solicitudes de exoneración (HU-018) y creación/seguimiento de pedidos de
 *   importación (HU-006).
 *
 * Historial de cambios:
 *   Responsable: Katherine Susana Valverde Fallas
 *   Fecha: 02/10/2026
 *   Descripción: se agrega la ruta del reporte de consultas internas (HU-036).
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 30/09/2026
 *   Descripción: se agrega la ruta de la búsqueda de trámites (HU-034).
 *
 *   Responsable: Katherine Susana Valverde Fallas
 *   Fecha: 30/09/2026
 *   Descripción: se agrega la ruta de la gestión documental del expediente (HU-045).
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 01/10/2026
 *   Descripción: la ruta /menu muestra el menú de trámites en lugar de la lista de desalmacenajes.
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 03/10/2026
 *   Descripción: se agregan las rutas del registro de donaciones (HU-024) y de la lista y el
 *     expediente de las donaciones (HU-044).
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 04/10/2026
 *   Descripción: se agregan las rutas de la lista, el registro y el expediente de las
 *     importaciones temporales (HU-025). La bandeja de alertas de vencimiento (HU-027) pasa a
 *     /tramites/temporales/alertas, y /tramites/temporales lleva a la lista de importaciones.
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 04/10/2026
 *   Descripción: se agregan las rutas de la exportación temporal (HU-026). La lista, el registro y
 *     el expediente son las mismas pantallas de la importación temporal, que reciben el tipo; la
 *     llave por tipo hace que la pantalla se cree de nuevo al pasar de un tipo al otro.
 *
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 05/10/2026
 *   Descripción: se agrega la ruta del control de documentos obligatorios de la exoneración
 *     (HU-021).
 *
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 05/10/2026
 *   Descripción: se agregan las rutas de la bandeja de aprobaciones y de la aprobación de la
 *     exoneración (HU-022).
 *
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 05/10/2026
 *   Descripción: se agrega la ruta del panel de trámites activos (HU-030).
 *   Descripción: se agrega la ruta de la solicitud / autorización EXONET del expediente de
 *     exoneración (HU-023).
 *
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 12/10/2026
 *   Descripción: se agregan las rutas públicas del registro y la validación de cuentas (HU-001) y
 *     las rutas protegidas de la gestión y la asignación de roles (HU-003).
 */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Frm_SIM_IniciarSesion />} />
      <Route path="/registro" element={<Frm_SIM_RegistrarUsuario />} />
      <Route path="/verificar" element={<Frm_SIM_VerificarCuenta />} />
      <Route element={<Cmp_SIM_RutaProtegida />}>
        <Route path="/menu" element={<Frm_SIM_Menu />} />
        <Route path="/tramites/desalmacenaje" element={<Frm_SIM_RegistrarDesalmacenaje />} />
        <Route path="/tramites/expedientes" element={<Lst_SIM_Expedientes />} />
        <Route path="/tramites/expedientes/:referenciaInterna" element={<Frm_SIM_Expediente />} />
        <Route path="/tramites/expedientes/:referenciaInterna/documentacion"
               element={<Frm_SIM_DocumentacionDesalmacenaje />} />
        <Route path="/tramites/exoneracion" element={<Frm_SIM_RegistrarExoneracion />} />
        <Route path="/tramites/exoneraciones/:referenciaInterna"
               element={<Frm_SIM_ExpedienteExoneracion />} />
        <Route path="/tramites/exoneraciones/:referenciaInterna/observaciones"
               element={<Frm_SIM_ObservacionesExoneracion />} />
        <Route path="/tramites/exoneraciones/:referenciaInterna/revision-documental"
              element={<Frm_SIM_RevisarDocumentacionExoneracion />}/>
        <Route path="/tramites/exoneraciones/:referenciaInterna/control-documental"
               element={<Frm_SIM_ControlDocumentalExoneracion />} />
        <Route path="/tramites/exoneraciones/aprobaciones" element={<Lst_SIM_AprobacionesExoneracion />} />
        <Route path="/tramites/exoneraciones/:referenciaInterna/aprobacion"
               element={<Frm_SIM_AprobarExoneracion />} />
        <Route path="/tramites/exoneraciones/:referenciaInterna/autorizacion-exonet"
               element={<Frm_SIM_AutorizacionExonet />} />
        <Route path="/tramites/importacion" element={<Frm_SIM_RegistrarImportacion />} />
        <Route path="/tramites/importaciones" element={<Lst_SIM_Importaciones />} />
        <Route path="/tramites/importaciones/nueva" element={<Frm_SIM_RegistrarImportacion />} />
        <Route path="/tramites/importaciones/:referenciaInterna" element={<Frm_SIM_RegistrarImportacion />} />
        <Route path="/tramites/donaciones" element={<Lst_SIM_Donaciones />} />
        <Route path="/tramites/donaciones/nueva" element={<Frm_SIM_RegistrarDonacion />} />
        <Route path="/tramites/donaciones/:referenciaInterna" element={<Frm_SIM_ExpedienteDonacion />} />
        <Route path="/tramites/temporales" element={<Navigate to="/tramites/importaciones-temporales" replace />} />
        <Route path="/tramites/temporales/alertas" element={<Frm_SIM_AlertasTemporales />} />
        <Route path="/tramites/importaciones-temporales"
               element={<Lst_SIM_TramitesTemporales key="importacion" tipo="importacion" />} />
        <Route path="/tramites/importaciones-temporales/nueva"
               element={<Frm_SIM_RegistrarTramiteTemporal key="importacion" tipo="importacion" />} />
        <Route path="/tramites/importaciones-temporales/:referenciaInterna"
               element={<Frm_SIM_ExpedienteTramiteTemporal key="importacion" tipo="importacion" />} />
        <Route path="/tramites/exportaciones-temporales"
               element={<Lst_SIM_TramitesTemporales key="exportacion" tipo="exportacion" />} />
        <Route path="/tramites/exportaciones-temporales/nueva"
               element={<Frm_SIM_RegistrarTramiteTemporal key="exportacion" tipo="exportacion" />} />
        <Route path="/tramites/exportaciones-temporales/:referenciaInterna"
               element={<Frm_SIM_ExpedienteTramiteTemporal key="exportacion" tipo="exportacion" />} />
        <Route path="/tramites/busqueda" element={<Lst_SIM_BuscarTramites />} />
        <Route path="/tramites/activos" element={<Lst_SIM_TramitesActivos />} />
        <Route path="/reportes/consultas-internas" element={<Frm_SIM_ReporteConsultas />} />
        <Route path="/roles" element={<Frm_SIM_GestionarRoles />} />
        <Route path="/asignar-roles" element={<Frm_SIM_AsignarRoles />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
