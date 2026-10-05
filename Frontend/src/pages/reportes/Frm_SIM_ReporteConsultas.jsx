import { useState } from "react";

import Cmp_SIM_Marco from "../../componentes/Cmp_SIM_Marco.jsx";
import { Cmp_SIM_AyudaCampo } from "../../componentes/Cmp_SIM_Ayuda.jsx";
import { generarReporteConsultas } from "../../servicios/Srv_SIM_Tramites.js";

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 25/09/2026
 * Descripción: Reporte de consultas internas (HU-036). Filtra los trámites por rango de fechas,
 *   tipo, régimen aduanero, dependencia responsable del costo y tipo de exoneración, y entrega
 *   un reporte tabulado con la cantidad de trámites, los totales por moneda, los permisos y los
 *   desgloses por tipo de trámite y por régimen aduanero, con exportación a CSV e impresión.
 */

const USUARIO_ACTUAL = "Agente de Aduanas";

const AGRUPACIONES = [
  { codigo: "TIPO_TRAMITE", nombre: "Tipo de trámite" },
  { codigo: "REGIMEN_ADUANERO", nombre: "Régimen aduanero" },
  { codigo: "PARTIDO_RESPONSABLE", nombre: "Partido responsable del costo" },
  { codigo: "DEPENDENCIA", nombre: "Dependencia de origen" },
  { codigo: "TIPO_EXONERACION", nombre: "Tipo de exoneración" },
  { codigo: "MES", nombre: "Mes de registro" },
];

const TIPOS_TRAMITE = [
  { codigo: "DESALM_ESPECIAL", nombre: "Desalmacenaje especial" },
  { codigo: "EXONERACION", nombre: "Solicitud de exoneración" },
  { codigo: "DONACION", nombre: "Donación" },
  { codigo: "COMPRA_FUND", nombre: "Compra de la Fundación" },
  { codigo: "PEDIDO_PROV", nombre: "Pedido a proveedor" },
];

const TIPOS_EXONERACION = [
  { codigo: "COMPRA_INSTITUCIONAL", nombre: "Compra institucional" },
  { codigo: "DONACION", nombre: "Donación" },
  { codigo: "CLIENTE_EXTERNO", nombre: "Cliente externo con contrato" },
  { codigo: "VEHICULOS", nombre: "Vehículos" },
  { codigo: "MOVIM_TRASPASO", nombre: "Movimiento de traspaso" },
];

const FILTROS_VACIOS = {
  fechaDesde: "",
  fechaHasta: "",
  tipoTramite: "",
  regimenAduanero: "",
  tipoExoneracion: "",
  dependencia: "",
  agruparPor: "TIPO_TRAMITE",
  enumerarTramites: false,
  desglosarPorTipo: true,
  desglosarPorRegimen: true,
};

const AYUDA = {
  titulo: "Ayuda: reporte de consultas internas",
  introduccion:
    "El reporte resume los trámites registrados para responder consultas sobre costos y "
    + "actividad. Se puede acotar por fechas y por los datos del expediente, y agrupar por el "
    + "criterio que pida la consulta.",
  pasos: [
    "Acote el reporte con el rango de fechas y los filtros que necesite.",
    "Elija el criterio de agrupación: por ejemplo por tipo de trámite o por régimen aduanero.",
    "Marque si desea enumerar los trámites y cuáles desgloses incluir.",
    "Presione Generar reporte y expórtelo a CSV o imprímalo.",
  ],
  dudas: [
    {
      pregunta: "¿Por qué los montos no se suman en un solo total?",
      respuesta:
        "Porque el sistema no registra tipo de cambio. Cada línea totaliza su moneda, de modo "
        + "que los colones y los dólares se leen por separado.",
    },
    {
      pregunta: "¿Dónde están los impuestos y los bodegajes?",
      respuesta:
        "El sistema todavía no registra esos montos, así que el reporte no los totaliza. "
        + "Aparecen como no disponibles para que no se lean como si fueran cero.",
    },
    {
      pregunta: "¿Qué es la dependencia responsable del costo?",
      respuesta:
        "Es la unidad que solicita el trámite y a la que se le carga el gasto. Hoy se registra "
        + "en el desalmacenaje especial; los trámites que no la declaran salen como sin registrar.",
    },
  ],
};

function formatearMonto(valor, moneda) {
  const numero = Number(valor ?? 0).toLocaleString("es-CR", {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return moneda && moneda !== "Sin moneda" ? `${moneda} ${numero}` : numero;
}

function formatearFecha(valor) {
  return valor
    ? new Date(valor).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
}

function formatearFechaHora(valor) {
  return valor
    ? new Date(valor).toLocaleString("es-CR", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";
}

/**
 * Arma el contenido CSV del reporte, con sus líneas y sus desgloses.
 *
 * @param {object} reporte reporte generado
 * @param {object} filtros criterios con los que se generó
 * @returns {string} contenido del archivo
 */
function armarCsv(reporte, filtros) {
  const escapar = (valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`;
  const lineas = [];
  const agrupacion = AGRUPACIONES.find((opcion) => opcion.codigo === reporte.agrupadoPor);

  lineas.push(["Reporte de consultas internas"].map(escapar).join(","));
  lineas.push(["Generado", formatearFechaHora(reporte.fechaGeneracion)].map(escapar).join(","));
  lineas.push(["Agrupado por", agrupacion?.nombre ?? reporte.agrupadoPor].map(escapar).join(","));
  lineas.push(["Rango", `${filtros.fechaDesde || "sin límite"} a ${filtros.fechaHasta || "sin límite"}`]
    .map(escapar).join(","));
  lineas.push(["Trámites", reporte.cantidadTramites].map(escapar).join(","));
  lineas.push(["Permisos regulatorios", reporte.cantidadPermisos].map(escapar).join(","));
  lineas.push("");

  const bloque = (titulo, filas) => {
    lineas.push([titulo].map(escapar).join(","));
    lineas.push(["Grupo", "Moneda", "Trámites", "Total CIF", "Permisos",
      "Impuestos pagados", "Impuestos exonerados", "Bodegaje"].map(escapar).join(","));
    (filas ?? []).forEach((fila) => lineas.push([
      fila.grupo, fila.moneda, fila.cantidadTramites, fila.totalCif, fila.cantidadPermisos,
      fila.totalImpuestosPagados, fila.totalImpuestosExonerados, fila.totalBodegaje,
    ].map(escapar).join(",")));
    lineas.push("");
  };

  bloque(agrupacion?.nombre ?? "Agrupación", reporte.agrupacion);
  if (filtros.desglosarPorTipo) {
    bloque("Desglose por tipo de trámite", reporte.porTipoTramite);
  }
  if (filtros.desglosarPorRegimen) {
    bloque("Desglose por régimen aduanero", reporte.porRegimenAduanero);
  }

  if ((reporte.tramites ?? []).length > 0) {
    lineas.push(["Trámites incluidos"].map(escapar).join(","));
    lineas.push(["Referencia", "Tipo", "Régimen", "Estado", "Moneda", "CIF", "Dependencia", "Registrado"]
      .map(escapar).join(","));
    reporte.tramites.forEach((tramite) => lineas.push([
      tramite.referenciaInterna, tramite.tipoTramite, tramite.regimenAduanero, tramite.estado,
      tramite.moneda, tramite.valorCif, tramite.origenDependencia, formatearFecha(tramite.fechaCreacion),
    ].map(escapar).join(",")));
  }

  return lineas.join("\n");
}

function Cmp_SIM_TablaResumen({ titulo, lineas }) {
  return (
    <div className="card sim-card mb-4">
      <div className="card-header d-flex justify-content-between align-items-center">
        <span><i className="bi bi-table me-2" aria-hidden="true"></i>{titulo}</span>
        <span className="badge text-bg-light text-dark">{(lineas ?? []).length}</span>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-sm align-middle mb-0">
            <caption className="visually-hidden">{titulo}</caption>
            <thead>
              <tr>
                <th scope="col">Grupo</th>
                <th scope="col">Moneda</th>
                <th scope="col" className="text-end">Trámites</th>
                <th scope="col" className="text-end">Total CIF</th>
                <th scope="col" className="text-end">Permisos</th>
                <th scope="col" className="text-end">Impuestos pagados</th>
                <th scope="col" className="text-end">Impuestos exonerados</th>
                <th scope="col" className="text-end">Bodegaje</th>
              </tr>
            </thead>
            <tbody>
              {(lineas ?? []).length === 0 && (
                <tr>
                  <td colSpan={8} className="text-muted small">
                    Ningún trámite cumple los criterios indicados.
                  </td>
                </tr>
              )}

              {(lineas ?? []).map((linea) => (
                <tr key={`${linea.grupo}-${linea.moneda}`}>
                  <td>{linea.grupo}</td>
                  <td>{linea.moneda}</td>
                  <td className="text-end">{linea.cantidadTramites}</td>
                  <td className="text-end sim-referencia">{formatearMonto(linea.totalCif, linea.moneda)}</td>
                  <td className="text-end">{linea.cantidadPermisos}</td>
                  <td className="text-end">{formatearMonto(linea.totalImpuestosPagados, linea.moneda)}</td>
                  <td className="text-end">
                    {formatearMonto(linea.totalImpuestosExonerados, linea.moneda)}
                  </td>
                  <td className="text-end">{formatearMonto(linea.totalBodegaje, linea.moneda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Frm_SIM_ReporteConsultas() {
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [reporte, setReporte] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [notasAbiertas, setNotasAbiertas] = useState(false);

  function cambiar(campo, valor) {
    setFiltros((anterior) => ({ ...anterior, [campo]: valor }));
  }

  async function generar(evento) {
    evento.preventDefault();
    setAlerta(null);

    if (filtros.fechaDesde && filtros.fechaHasta && filtros.fechaHasta < filtros.fechaDesde) {
      setAlerta({ tipo: "danger", texto: "La fecha final del rango no puede ser anterior a la inicial." });
      return;
    }

    setGenerando(true);
    try {
      setReporte(await generarReporteConsultas(filtros));
    } catch (problema) {
      setReporte(null);
      setAlerta({ tipo: "danger", texto: `No fue posible generar el reporte. ${problema.message}` });
    } finally {
      setGenerando(false);
    }
  }

  function exportarCsv() {
    const contenido = armarCsv(reporte, filtros);
    // El BOM hace que Excel abra el archivo con los acentos correctos.
    const archivo = new Blob([`﻿${contenido}`], { type: "text/csv;charset=utf-8;" });
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(archivo);
    enlace.download = `reporte-consultas-internas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(enlace.href);
  }

  const agrupacion = AGRUPACIONES.find((opcion) => opcion.codigo === reporte?.agrupadoPor);

  return (
    <Cmp_SIM_Marco usuario={USUARIO_ACTUAL} ayuda={AYUDA}>
      <section className="sim-encabezado p-3 mb-4 shadow-sm">
        <h1 className="h4 mb-0">Reporte de consultas internas</h1>
      </section>

      {alerta && <div className={`alert alert-${alerta.tipo}`} role="alert">{alerta.texto}</div>}

      <div className="card sim-card mb-4 d-print-none">
        <div className="card-header">
          <i className="bi bi-funnel me-2" aria-hidden="true"></i>Criterios del reporte
        </div>
        <div className="card-body">
          <form onSubmit={generar} noValidate>
            <div className="row g-3">
              <div className="col-12 col-md-3">
                <label className="form-label" htmlFor="txtFechaDesde">Desde</label>
                <input type="date" className="form-control" id="txtFechaDesde"
                       value={filtros.fechaDesde}
                       onChange={(evento) => cambiar("fechaDesde", evento.target.value)} />
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label" htmlFor="txtFechaHasta">Hasta</label>
                <input type="date" className="form-control" id="txtFechaHasta"
                       value={filtros.fechaHasta}
                       onChange={(evento) => cambiar("fechaHasta", evento.target.value)} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="cmbAgruparPor">
                  Agrupar por
                  <Cmp_SIM_AyudaCampo titulo="el criterio de agrupación">
                    Define cómo se tabulan las líneas del reporte. Los desgloses por tipo de trámite
                    y por régimen aduanero se incluyen aparte, sin importar la agrupación elegida.
                  </Cmp_SIM_AyudaCampo>
                </label>
                <select className="form-select" id="cmbAgruparPor" value={filtros.agruparPor}
                        onChange={(evento) => cambiar("agruparPor", evento.target.value)}>
                  {AGRUPACIONES.map((opcion) => (
                    <option value={opcion.codigo} key={opcion.codigo}>{opcion.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="cmbTipoTramite">Tipo de trámite</label>
                <select className="form-select" id="cmbTipoTramite" value={filtros.tipoTramite}
                        onChange={(evento) => cambiar("tipoTramite", evento.target.value)}>
                  <option value="">Todos los tipos</option>
                  {TIPOS_TRAMITE.map((tipo) => (
                    <option value={tipo.codigo} key={tipo.codigo}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="txtRegimenAduanero">Régimen aduanero</label>
                <input type="text" className="form-control" id="txtRegimenAduanero" maxLength={60}
                       value={filtros.regimenAduanero}
                       onChange={(evento) => cambiar("regimenAduanero", evento.target.value)} />
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="cmbTipoExoneracion">Tipo de exoneración</label>
                <select className="form-select" id="cmbTipoExoneracion" value={filtros.tipoExoneracion}
                        onChange={(evento) => cambiar("tipoExoneracion", evento.target.value)}>
                  <option value="">Todos</option>
                  {TIPOS_EXONERACION.map((tipo) => (
                    <option value={tipo.codigo} key={tipo.codigo}>{tipo.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="txtDependencia">
                  Partido o dependencia responsable
                  <Cmp_SIM_AyudaCampo titulo="el partido responsable">
                    Escriba parte del nombre de la unidad a la que se le carga el gasto. El filtro
                    busca tanto en el partido responsable como en la dependencia de origen.
                  </Cmp_SIM_AyudaCampo>
                </label>
                <input type="text" className="form-control" id="txtDependencia" maxLength={120}
                       value={filtros.dependencia}
                       onChange={(evento) => cambiar("dependencia", evento.target.value)} />
              </div>

              <div className="col-12 col-md-6">
                <fieldset>
                  <legend className="form-label h6">Opciones</legend>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="chkEnumerarTramites"
                           checked={filtros.enumerarTramites}
                           onChange={(evento) => cambiar("enumerarTramites", evento.target.checked)} />
                    <label className="form-check-label" htmlFor="chkEnumerarTramites">
                      Enumerar los trámites
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="chkDesglosarPorTipo"
                           checked={filtros.desglosarPorTipo}
                           onChange={(evento) => cambiar("desglosarPorTipo", evento.target.checked)} />
                    <label className="form-check-label" htmlFor="chkDesglosarPorTipo">
                      Desglosar por tipo de trámite
                    </label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="chkDesglosarPorRegimen"
                           checked={filtros.desglosarPorRegimen}
                           onChange={(evento) => cambiar("desglosarPorRegimen", evento.target.checked)} />
                    <label className="form-check-label" htmlFor="chkDesglosarPorRegimen">
                      Desglosar por régimen aduanero
                    </label>
                  </div>
                </fieldset>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="button" className="btn btn-outline-secondary" id="btnLimpiarCriterios"
                      onClick={() => { setFiltros(FILTROS_VACIOS); setReporte(null); setAlerta(null); }}>
                Limpiar
              </button>
              <button type="submit" className="btn btn-sim" id="btnGenerarReporte" disabled={generando}>
                {generando ? "Generando..." : "Generar reporte"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {reporte && (
        <>
          <div className="card sim-card mb-4">
            <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span>
                <i className="bi bi-clipboard-data me-2" aria-hidden="true"></i>
                Resumen · {agrupacion?.nombre ?? reporte.agrupadoPor}
              </span>
              <span className="d-print-none d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" id="btnExportarCsv"
                        onClick={exportarCsv}>
                  <i className="bi bi-filetype-csv me-1" aria-hidden="true"></i>Exportar CSV
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" id="btnImprimirReporte"
                        onClick={() => window.print()}>
                  <i className="bi bi-printer me-1" aria-hidden="true"></i>Imprimir
                </button>
              </span>
            </div>
            <div className="card-body">
              <dl className="row mb-0">
                <dt className="col-6 col-md-3">Trámites</dt>
                <dd className="col-6 col-md-3">{reporte.cantidadTramites}</dd>
                <dt className="col-6 col-md-3">Permisos regulatorios</dt>
                <dd className="col-6 col-md-3">{reporte.cantidadPermisos}</dd>
                <dt className="col-6 col-md-3">Generado</dt>
                <dd className="col-6 col-md-3">{formatearFechaHora(reporte.fechaGeneracion)}</dd>
                <dt className="col-6 col-md-3">Rango</dt>
                <dd className="col-6 col-md-3">
                  {filtros.fechaDesde || "sin límite"} a {filtros.fechaHasta || "sin límite"}
                </dd>
              </dl>

              {(reporte.notas ?? []).length > 0 && (
                <div className="alert alert-info py-2 mt-3 mb-0" role="alert">
                  <button type="button"
                          className="btn btn-link p-0 text-start text-reset text-decoration-none w-100 d-flex align-items-center gap-2"
                          id="btnNotasReporte"
                          aria-expanded={notasAbiertas}
                          aria-controls="lstNotasReporte"
                          onClick={() => setNotasAbiertas(!notasAbiertas)}>
                    <i className="bi bi-info-circle" aria-hidden="true"></i>
                    <span className="text-truncate flex-grow-1">{reporte.notas[0]}</span>
                    <span className="badge text-bg-info">{reporte.notas.length}</span>
                    <i className={`bi ${notasAbiertas ? "bi-chevron-up" : "bi-chevron-down"}`}
                       aria-hidden="true"></i>
                  </button>
                  {notasAbiertas && (
                    <ul className="mb-0 mt-2" id="lstNotasReporte">
                      {reporte.notas.map((nota) => <li key={nota}>{nota}</li>)}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          <Cmp_SIM_TablaResumen titulo={agrupacion?.nombre ?? "Agrupación"} lineas={reporte.agrupacion} />

          {filtros.desglosarPorTipo && (
            <Cmp_SIM_TablaResumen titulo="Desglose por tipo de trámite" lineas={reporte.porTipoTramite} />
          )}

          {filtros.desglosarPorRegimen && (
            <Cmp_SIM_TablaResumen titulo="Desglose por régimen aduanero" lineas={reporte.porRegimenAduanero} />
          )}

          {filtros.enumerarTramites && (
            <div className="card sim-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-list-ul me-2" aria-hidden="true"></i>Trámites incluidos</span>
                <span className="badge text-bg-light text-dark">{(reporte.tramites ?? []).length}</span>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm align-middle mb-0">
                    <caption className="visually-hidden">Trámites que incluye el reporte</caption>
                    <thead>
                      <tr>
                        <th scope="col">Referencia</th>
                        <th scope="col">Tipo</th>
                        <th scope="col">Régimen</th>
                        <th scope="col">Dependencia</th>
                        <th scope="col" className="text-end">CIF</th>
                        <th scope="col">Estado</th>
                        <th scope="col">Registrado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(reporte.tramites ?? []).length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-muted small">
                            Ningún trámite cumple los criterios indicados.
                          </td>
                        </tr>
                      )}

                      {(reporte.tramites ?? []).map((tramite) => (
                        <tr key={tramite.referenciaInterna}>
                          <td className="sim-referencia">{tramite.referenciaInterna}</td>
                          <td>{tramite.tipoTramite}</td>
                          <td>{tramite.regimenAduanero ?? "—"}</td>
                          <td>{tramite.origenDependencia ?? "—"}</td>
                          <td className="text-end">
                            {tramite.valorCif === null || tramite.valorCif === undefined
                              ? "—"
                              : formatearMonto(tramite.valorCif, tramite.moneda)}
                          </td>
                          <td>{tramite.estado}</td>
                          <td>{formatearFecha(tramite.fechaCreacion)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Cmp_SIM_Marco>
  );
}

export default Frm_SIM_ReporteConsultas;
