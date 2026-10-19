import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Cmp_SIM_Marco from "../../componentes/Cmp_SIM_Marco.jsx";
import Cmp_SIM_Documentos, { contarArchivos } from "../../componentes/Cmp_SIM_Documentos.jsx";
import { Cmp_SIM_AyudaCampo } from "../../componentes/Cmp_SIM_Ayuda.jsx";
import {
  agregarDocumentos,
  clasificarDocumento,
  guardarEstadoDocumental,
  descargarDocumento,
  obtenerExpediente,
} from "../../servicios/Srv_SIM_Tramites.js";

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 25/09/2026
 * Descripción: Gestión documental del expediente de desalmacenaje especial (HU-045). Permite
 *   adjuntar documentación probatoria sin perder la ya registrada, clasificar cada documento
 *   según su tipo, dejar constancia de si el expediente está documentalmente completo o
 *   incompleto y consultar el registro de los cambios con su fecha, hora y responsable.
 *
 * Historial de cambios:
 *   Responsable: Josue Guevara Lostalo
 *   Fecha: 02/10/2026
 *   Descripción: la descarga de documentos usa descargarDocumento, que envía el token de la
 *     sesión, en lugar de la ruta directa que se eliminó con el inicio de sesión (HU-004).
 */

const USUARIO_ACTUAL = "Analista de Importaciones";

/** Clasificaciones que admite el expediente, según el catálogo de tipos de documento. */
const CLASIFICACIONES = [
  { codigo: "RESPALDO", nombre: "Justificación, acta de salida histórica o documento atípico" },
  { codigo: "PACKING_LIST", nombre: "Lista de empaque" },
  { codigo: "FACTURA", nombre: "Factura o documento equivalente" },
  { codigo: "EMBARQUE", nombre: "Documento de embarque" },
  { codigo: "PERMISO_REGULATORIO", nombre: "Permiso regulatorio" },
  { codigo: "TRADUCCION_FACTURA", nombre: "Traducción de factura" },
];

/** Documentación que el expediente espera reunir para considerarse completo. */
const DOCUMENTACION_ESPERADA = [
  "Justificación, acta de salida histórica o documento atípico",
  "Lista de empaque",
  "Factura o documento equivalente",
  "Documento de embarque",
];

const DOCUMENTOS_POR_ADJUNTAR = [
  {
    codigo: "documentosRespaldo",
    nombre: "Justificación, acta o documento de respaldo",
    obligatorio: false,
    multiple: true,
    ayuda: "Puede adjuntar varios archivos: el expediente conserva los que ya tenía.",
  },
  { codigo: "packingList", nombre: "Lista de empaque", obligatorio: false },
  { codigo: "factura", nombre: "Factura o documento equivalente", obligatorio: false },
  { codigo: "documentoEmbarque", nombre: "Documento de embarque", obligatorio: false },
];

const ARCHIVOS_VACIOS = Object.fromEntries(
  DOCUMENTOS_POR_ADJUNTAR.map((documento) => [documento.codigo, []])
);

const AYUDA = {
  titulo: "Ayuda: gestionar la documentación del expediente",
  introduccion:
    "Esta pantalla reúne la documentación probatoria del desalmacenaje especial. Sirve para "
    + "determinar la naturaleza del trámite y para saber si el expediente puede continuar su "
    + "gestión o su reclasificación.",
  pasos: [
    "Adjunte la documentación que llegue. La que ya estaba registrada se conserva.",
    "Revise la clasificación de cada documento y corríjala si no corresponde a su tipo.",
    "Indique si el expediente está documentalmente completo o incompleto y anote lo que observe.",
    "Consulte el registro de cambios para ver quién modificó la documentación y cuándo.",
  ],
  dudas: [
    {
      pregunta: "¿Se pierde un documento al cambiarle la clasificación?",
      respuesta:
        "No. El archivo es el mismo y conserva su versión; solo cambia el tipo con el que queda "
        + "clasificado dentro del expediente, y el cambio queda registrado.",
    },
    {
      pregunta: "¿Puedo marcar completo un expediente al que le falta documentación?",
      respuesta:
        "Sí, pero el sistema le muestra antes lo que falta. Deje la razón en las observaciones "
        + "documentales para que quien revise el expediente después la encuentre.",
    },
    {
      pregunta: "¿Para qué sirve la clasificación?",
      respuesta:
        "Permite comparar lo que tiene el expediente contra lo que exige otro tipo de trámite, "
        + "que es lo que se necesita cuando el desalmacenaje se va a reclasificar.",
    },
  ],
};

function formatearFechaHora(valor) {
  return valor
    ? new Date(valor).toLocaleString("es-CR", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";
}

function Frm_SIM_DocumentacionDesalmacenaje() {
  const { referenciaInterna } = useParams();
  const [expediente, setExpediente] = useState(null);
  const [clasificaciones, setClasificaciones] = useState({});
  const [archivos, setArchivos] = useState(ARCHIVOS_VACIOS);
  const [estadoDocumental, setEstadoDocumental] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [alerta, setAlerta] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [faltantesAbiertos, setFaltantesAbiertos] = useState(false);

  useEffect(() => {
    let vigente = true;

    obtenerExpediente(referenciaInterna)
      .then((detalle) => {
        if (vigente) {
          refrescar(detalle);
        }
      })
      .catch((problema) => {
        if (vigente) {
          setAlerta({ tipo: "danger", texto: `No fue posible cargar el expediente. ${problema.message}` });
        }
      });

    return () => { vigente = false; };
  }, [referenciaInterna]);

  function refrescar(detalle) {
    setExpediente(detalle);
    setClasificaciones({});
    setEstadoDocumental(detalle.estadoDocumental ?? "");
    setObservaciones(detalle.observacionesDocumentales ?? "");
  }

  const documentosVigentes = useMemo(
    () => (expediente?.documentos ?? []).filter((documento) => documento.estadoDocumento === "ACT"),
    [expediente]
  );

  const faltantes = useMemo(() => {
    const registrados = new Set(documentosVigentes.map((documento) => documento.tipoDocumento));
    return DOCUMENTACION_ESPERADA.filter((nombre) => !registrados.has(nombre));
  }, [documentosVigentes]);

  const cambiosDeClasificacion = Object.entries(clasificaciones).filter(([idDocumento, codigo]) => {
    const documento = documentosVigentes.find((registro) => String(registro.idDocumento) === idDocumento);
    const actual = CLASIFICACIONES.find((clasificacion) => clasificacion.nombre === documento?.tipoDocumento);
    return codigo && codigo !== actual?.codigo;
  });

  async function guardarClasificacion(evento) {
    evento.preventDefault();
    setAlerta(null);
    setGuardando(true);
    try {
      let detalle = expediente;
      for (const [idDocumento, codigo] of cambiosDeClasificacion) {
        detalle = await clasificarDocumento(referenciaInterna, Number(idDocumento), codigo);
      }
      refrescar(detalle);
      setAlerta({
        tipo: "success",
        texto: cambiosDeClasificacion.length === 1
          ? "La clasificación del documento se guardó y el cambio quedó registrado."
          : `Se guardó la clasificación de ${cambiosDeClasificacion.length} documentos.`,
      });
    } catch (problema) {
      setAlerta({ tipo: "danger", texto: `No fue posible guardar la clasificación. ${problema.message}` });
    } finally {
      setGuardando(false);
    }
  }

  async function adjuntar(evento) {
    evento.preventDefault();
    setAlerta(null);
    setGuardando(true);
    try {
      refrescar(await agregarDocumentos(referenciaInterna, archivos));
      setArchivos(ARCHIVOS_VACIOS);
      setAlerta({
        tipo: "success",
        texto: "La documentación se agregó al expediente. Los documentos anteriores se conservan.",
      });
    } catch (problema) {
      setAlerta({ tipo: "danger", texto: `No fue posible agregar la documentación. ${problema.message}` });
    } finally {
      setGuardando(false);
    }
  }

  async function guardarEstado(evento) {
    evento.preventDefault();
    setAlerta(null);

    if (!estadoDocumental) {
      setAlerta({ tipo: "danger", texto: "Indique si el expediente está completo o incompleto." });
      return;
    }

    setGuardando(true);
    try {
      refrescar(await guardarEstadoDocumental(referenciaInterna, estadoDocumental, observaciones));
      setAlerta({
        tipo: "success",
        texto: "El estado documental del expediente quedó registrado con su responsable y su fecha.",
      });
    } catch (problema) {
      setAlerta({ tipo: "danger", texto: `No fue posible guardar el estado documental. ${problema.message}` });
    } finally {
      setGuardando(false);
    }
  }

  if (!expediente) {
    return (
      <Cmp_SIM_Marco usuario={USUARIO_ACTUAL} ayuda={AYUDA}>
        {alerta
          ? <div className={`alert alert-${alerta.tipo}`} role="alert">{alerta.texto}</div>
          : <p className="text-muted">Cargando el expediente...</p>}
        <Link className="btn btn-outline-secondary" to="/tramites/expedientes">Volver a los expedientes</Link>
      </Cmp_SIM_Marco>
    );
  }

  return (
    <Cmp_SIM_Marco usuario={USUARIO_ACTUAL} ayuda={AYUDA}>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/tramites/expedientes">Expedientes</Link></li>
          <li className="breadcrumb-item">
            <Link to={`/tramites/expedientes/${encodeURIComponent(expediente.referenciaInterna)}`}>
              {expediente.referenciaInterna}
            </Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">Documentación</li>
        </ol>
      </nav>

      <section className="sim-encabezado p-3 mb-4 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h1 className="h4 mb-1">
              Documentación de <span className="sim-referencia">{expediente.referenciaInterna}</span>
            </h1>
            <p className="mb-0 text-muted small">{expediente.origenDependencia}</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge fs-6 ${estadoDocumental === "COMPLETO"
              ? "text-bg-success" : estadoDocumental === "INCOMPLETO" ? "text-bg-warning" : "text-bg-light text-dark"}`}>
              {estadoDocumental === "COMPLETO"
                ? "Documentalmente completo"
                : estadoDocumental === "INCOMPLETO" ? "Documentalmente incompleto" : "Estado documental sin definir"}
            </span>
          </div>
        </div>
      </section>

      {alerta && <div className={`alert alert-${alerta.tipo}`} role="alert">{alerta.texto}</div>}

      <div className="card sim-card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span><i className="bi bi-folder2-open me-2" aria-hidden="true"></i>Documentación registrada</span>
          <span className="badge text-bg-light text-dark">{documentosVigentes.length}</span>
        </div>
        <div className="card-body">
          <form onSubmit={guardarClasificacion} noValidate>
            <div className="table-responsive">
              <table className="table table-sm align-middle mb-0">
                <caption className="visually-hidden">
                  Documentos del expediente y su clasificación
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Archivo</th>
                    <th scope="col">Clasificación</th>
                    <th scope="col">Versión</th>
                    <th scope="col">Cargado</th>
                  </tr>
                </thead>
                <tbody>
                  {documentosVigentes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-muted small">
                        El expediente todavía no tiene documentación registrada.
                      </td>
                    </tr>
                  )}

                  {documentosVigentes.map((documento) => {
                    const actual = CLASIFICACIONES.find(
                      (clasificacion) => clasificacion.nombre === documento.tipoDocumento
                    );
                    return (
                      <tr key={documento.idDocumento}>
                        <td>
                          <button type="button" className="btn btn-link btn-sm p-0 text-start"
                                  onClick={() => descargarDocumento(
                                    documento.idDocumento,
                                    documento.nombreArchivo
                                  ).catch((problema) => setAlerta({
                                    tipo: "danger",
                                    texto: `No fue posible descargar el documento. ${problema.message}`,
                                  }))}>
                            {documento.nombreArchivo}
                          </button>
                        </td>
                        <td>
                          <label className="visually-hidden" htmlFor={`cmbClasificacion${documento.idDocumento}`}>
                            Clasificación de {documento.nombreArchivo}
                          </label>
                          <select className="form-select form-select-sm"
                                  id={`cmbClasificacion${documento.idDocumento}`}
                                  value={clasificaciones[documento.idDocumento] ?? actual?.codigo ?? ""}
                                  onChange={(evento) => setClasificaciones({
                                    ...clasificaciones, [documento.idDocumento]: evento.target.value,
                                  })}>
                            <option value="">Sin clasificar</option>
                            {CLASIFICACIONES.map((clasificacion) => (
                              <option value={clasificacion.codigo} key={clasificacion.codigo}>
                                {clasificacion.nombre}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-center">{documento.version}</td>
                        <td>{formatearFechaHora(documento.fechaCarga)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-outline-secondary" id="btnDeshacerClasificacion"
                      onClick={() => setClasificaciones({})} disabled={cambiosDeClasificacion.length === 0}>
                Deshacer
              </button>
              <button type="submit" className="btn btn-sim" id="btnGuardarClasificacion"
                      disabled={guardando || cambiosDeClasificacion.length === 0}>
                {guardando ? "Guardando..." : `Guardar clasificación (${cambiosDeClasificacion.length})`}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card sim-card mb-4">
        <div className="card-header">
          <i className="bi bi-paperclip me-2" aria-hidden="true"></i>Agregar documentación probatoria
        </div>
        <div className="card-body">
          <form onSubmit={adjuntar} noValidate>
            <Cmp_SIM_Documentos documentos={DOCUMENTOS_POR_ADJUNTAR} archivos={archivos}
                                alCambiar={setArchivos} />
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-outline-secondary" id="btnLimpiarArchivos"
                      onClick={() => setArchivos(ARCHIVOS_VACIOS)}>
                Limpiar
              </button>
              <button type="submit" className="btn btn-sim" id="btnAgregarDocumentos"
                      disabled={guardando || contarArchivos(archivos) === 0}>
                Agregar al expediente
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card sim-card mb-4">
        <div className="card-header">
          <i className="bi bi-clipboard-check me-2" aria-hidden="true"></i>Estado documental
        </div>
        <div className="card-body">
          {faltantes.length > 0 && (
            <div className="alert alert-warning py-2" role="alert">
              <button type="button"
                      className="btn btn-link p-0 text-start text-reset text-decoration-none w-100 d-flex align-items-center gap-2"
                      id="btnFaltantes"
                      aria-expanded={faltantesAbiertos}
                      aria-controls="lstFaltantes"
                      onClick={() => setFaltantesAbiertos(!faltantesAbiertos)}>
                <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                <span className="text-truncate flex-grow-1">
                  <strong>Falta clasificar o adjuntar:</strong> {faltantes.join(", ")}
                </span>
                <span className="badge text-bg-warning">{faltantes.length}</span>
                <i className={`bi ${faltantesAbiertos ? "bi-chevron-up" : "bi-chevron-down"}`}
                   aria-hidden="true"></i>
              </button>
              {faltantesAbiertos && (
                <ul className="mb-0 mt-2" id="lstFaltantes">
                  {faltantes.map((nombre) => <li key={nombre}>{nombre}</li>)}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={guardarEstado} noValidate>
            <fieldset className="mb-3">
              <legend className="form-label sim-requerido h6">
                El expediente está
                <Cmp_SIM_AyudaCampo titulo="el estado documental">
                  Completo significa que el expediente reúne la documentación que exige el trámite.
                  Incompleto deja constancia de que falta algo y de qué se está a la espera.
                </Cmp_SIM_AyudaCampo>
              </legend>

              <div className="form-check">
                <input className="form-check-input" type="radio" name="estadoDocumental" id="optCompleto"
                       value="COMPLETO" checked={estadoDocumental === "COMPLETO"}
                       onChange={(evento) => setEstadoDocumental(evento.target.value)} />
                <label className="form-check-label" htmlFor="optCompleto">Documentalmente completo</label>
              </div>

              <div className="form-check">
                <input className="form-check-input" type="radio" name="estadoDocumental" id="optIncompleto"
                       value="INCOMPLETO" checked={estadoDocumental === "INCOMPLETO"}
                       onChange={(evento) => setEstadoDocumental(evento.target.value)} />
                <label className="form-check-label" htmlFor="optIncompleto">Documentalmente incompleto</label>
              </div>
            </fieldset>

            <label className="form-label" htmlFor="txtObservacionesDocumentales">
              Observaciones documentales <span className="sim-opcional">(opcional)</span>
            </label>
            <textarea className="form-control" id="txtObservacionesDocumentales" rows={3} maxLength={1000}
                      value={observaciones}
                      onChange={(evento) => setObservaciones(evento.target.value)} />
            <div className="form-text text-end">{observaciones.length}/1000</div>

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-sim" id="btnGuardarEstadoDocumental" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar estado documental"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card sim-card">
        <div className="card-header">
          <i className="bi bi-clock-history me-2" aria-hidden="true"></i>Registro de cambios
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-sm align-middle mb-0">
              <caption className="visually-hidden">
                Cambios registrados sobre la documentación del expediente
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fecha y hora</th>
                  <th scope="col">Cambio</th>
                  <th scope="col">Usuario responsable</th>
                </tr>
              </thead>
              <tbody>
                {(expediente.bitacora ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-muted small">
                      Todavía no hay cambios documentales registrados.
                    </td>
                  </tr>
                )}

                {(expediente.bitacora ?? []).map((movimiento) => (
                  <tr key={movimiento.idBitacora}>
                    <td>{formatearFechaHora(movimiento.fechaHora)}</td>
                    <td>
                      <div>{movimiento.descripcionAccion ?? movimiento.accion}</div>
                      {movimiento.datosNuevos && (
                        <div className="text-muted small">{movimiento.datosNuevos}</div>
                      )}
                    </td>
                    <td>{movimiento.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Cmp_SIM_Marco>
  );
}

export default Frm_SIM_DocumentacionDesalmacenaje;
