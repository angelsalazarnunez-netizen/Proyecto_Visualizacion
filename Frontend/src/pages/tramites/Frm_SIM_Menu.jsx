import { Link } from "react-router-dom";

import Cmp_SIM_Marco from "../../componentes/Cmp_SIM_Marco.jsx";
import { obtenerSesion } from "../../servicios/Srv_SIM_Autenticacion.js";

/**
 * Autor: Josue Guevara Lostalo
 * Fecha: 01/10/2026
 * Descripción: Menú de trámites que se muestra después del inicio de sesión. Presenta una tarjeta
 *   por cada tipo de trámite disponible y lleva a su pantalla de consulta.
 *
 * Historial de cambios:
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 03/10/2026
 *   Descripción: se agrega la tarjeta de donaciones (HU-024 y HU-044).
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 04/10/2026
 *   Descripción: la tarjeta de trámites temporales pasa a ser la de importaciones temporales
 *     (HU-025), desde la que se llega también a las alertas de vencimiento (HU-027). La
 *     exportación temporal tendrá su propia tarjeta en su historia de usuario.
 *
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 04/10/2026
 *   Descripción: se agrega la tarjeta de exportaciones temporales (HU-026).
 */

// Cada trámite nuevo se agrega como un elemento más de esta lista.
const OPCIONES_TRAMITE = [
  {
    titulo: "Desalmacenaje especial",
    descripcion: "Registrar desalmacenajes especiales y dar seguimiento a sus expedientes.",
    icono: "bi-truck",
    ruta: "/tramites/expedientes",
    textoBoton: "Entrar",
  },
  {
    titulo: "Solicitudes de importación",
    descripcion: "Crear pedidos de importación a proveedores y consultar su avance.",
    icono: "bi-box-seam",
    ruta: "/tramites/importaciones",
    textoBoton: "Entrar",
  },
  {
    titulo: "Exoneraciones",
    descripcion: "Registrar solicitudes de exoneración y consultar sus expedientes.",
    icono: "bi-file-earmark-check",
    ruta: "/tramites/exoneracion",
    textoBoton: "Entrar",
  },
  {
    titulo: "Donaciones",
    descripcion: "Registrar donaciones y dar seguimiento a sus expedientes.",
    icono: "bi-gift",
    ruta: "/tramites/donaciones",
    textoBoton: "Entrar",
  },
  {
    titulo: "Importaciones temporales",
    descripcion: "Registrar la entrada temporal de equipos, seguir su vencimiento y atender sus alertas.",
    icono: "bi-box-arrow-in-down",
    ruta: "/tramites/importaciones-temporales",
    textoBoton: "Entrar",
  },
  {
    titulo: "Exportaciones temporales",
    descripcion: "Registrar la salida temporal de equipos al extranjero, seguir su vencimiento y su reimportación.",
    icono: "bi-box-arrow-up",
    ruta: "/tramites/exportaciones-temporales",
    textoBoton: "Entrar",
  },
  {
    titulo: "Buscar trámites",
    descripcion: "Buscar y filtrar trámites de todos los tipos y exportar el listado.",
    icono: "bi-search",
    ruta: "/tramites/busqueda",
    textoBoton: "Entrar",
  },
];

const AYUDA = {
  titulo: "Ayuda: Menú de trámites",
  introduccion:
    "Esta pantalla reúne los trámites del sistema. Desde aquí se entra a la pantalla de cada tipo "
    + "de trámite para registrarlo o darle seguimiento.",
  pasos: [
    "Ubique la tarjeta del tipo de trámite que necesita.",
    "Presione el botón de la tarjeta para abrir su pantalla.",
    "Para volver a este menú desde cualquier pantalla, presione el nombre del sistema en la barra superior.",
  ],
  dudas: [
    {
      pregunta: "¿Por qué no aparece un tipo de trámite?",
      respuesta:
        "Solo se muestran los trámites que ya están disponibles en el sistema. Los demás se agregan "
        + "a este menú conforme se habilitan.",
    },
  ],
};

function Frm_SIM_Menu() {
  const nombreUsuario = obtenerSesion()?.nombreCompleto || "Usuario de la sesión";

  return (
    <Cmp_SIM_Marco usuario={nombreUsuario} ayuda={AYUDA}>
      <section className="sim-encabezado p-3 mb-4 shadow-sm">
        <h1 className="h4 mb-1">Trámites</h1>
        <p className="small text-muted mb-0">
          Bienvenido(a), {nombreUsuario}. Seleccione el tipo de trámite con el que desea trabajar.
        </p>
      </section>

      <div className="row g-3">
        {OPCIONES_TRAMITE.map((opcion) => (
          <div className="col-12 col-md-6 col-lg-3" key={opcion.ruta}>
            <div className="card sim-card shadow-sm h-100">
              <div className="card-body d-flex flex-column">
                <i className={`bi ${opcion.icono} fs-2 text-primary mb-2`} aria-hidden="true"></i>
                <h2 className="h5">{opcion.titulo}</h2>
                <p className="text-muted small flex-grow-1">{opcion.descripcion}</p>
                <Link className="btn btn-sim align-self-start" to={opcion.ruta}>
                  {opcion.textoBoton}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Cmp_SIM_Marco>
  );
}

export default Frm_SIM_Menu;
