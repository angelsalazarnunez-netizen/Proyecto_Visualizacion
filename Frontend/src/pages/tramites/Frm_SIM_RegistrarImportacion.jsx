import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import Cmp_SIM_Marco from "../../componentes/Cmp_SIM_Marco.jsx";
import {
  Cmp_SIM_AvisoSoloConsulta,
  useSesionActual,
} from "../../componentes/seguridad/Cmp_SIM_ConPermiso.jsx";
import { PERMISOS } from "../../utilerias/Permisos.js";
import { obtenerSesion } from "../../servicios/Srv_SIM_Autenticacion.js";
import {
  actualizarPedidoImportacion,
  obtenerCatalogosPedidoImportacion,
  obtenerPedidoImportacion,
  registrarPedidoImportacion,
} from "../../servicios/Srv_SIM_Tramites.js";

/**
 * Historial de cambios:
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 18/10/2026
 *   Descripción: comentario de la Unidad (Sprint 1): el pedido ya existe y aquí solo se registra,
 *     así que la pantalla se llama "Registro de pedido de importación". El estado se elige de la
 *     lista del catálogo y el inicial es "Pendiente de pago" (pago ante la OAF).
 *
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 19/10/2026
 *   Descripción: restricciones por rol (HU-003). Un pedido existente sin IMPORTACION_MODIFICAR se
 *     muestra en modo de consulta: los campos quedan deshabilitados y no se ofrece guardar.
 */

const ESTADO_INICIAL_PEDIDO = "Pendiente de pago";

const AYUDA = {
  titulo: "Ayuda: registro de pedido de importación",
  introduccion:
    "Registre en el sistema un pedido de importación que ya existe. Las fechas de seguimiento y "
    + "los montos que todavía no se conocen pueden completarse después.",
  pasos: [
    "Digite los últimos tres números del registro, del pedido y de la orden de compra; el año se completa automáticamente.",
    "Las unidades solicitantes, compañías, incoterms y monedas usados se guardan como sugerencias para solicitudes futuras.",
    "La fecha de transferencia activa una notificación cuando han transcurrido tres días calendario.",
    "El pedido inicia en Pendiente de pago; cambie el estado eligiéndolo de la lista conforme avance.",
    "El encargado se toma de la sesión y no se puede cambiar desde este formulario.",
  ],
  dudas: [],
};

const FORMULARIO_VACIO = {
  numeroSolicitud: "",
  cantidadSolicitada: "",
  fechaRecibidoExpediente: "",
  unidadSolicitante: "",
  descripcion: "",
  consecutivoContratacion: "",
  consecutivoPedido: "",
  companiaAdjudicada: "",
  consecutivoOrdenCompra: "",
  incoterm: "",
  presupuestoOrdenCRC: "",
  montoOrden: "",
  monedaOrden: "CRC",
  saldoDisponible: "",
  fechaRecibidoSpOaf: "",
  fechaRecibidoCopiaChequeUi: "",
  fechaTransferencia: "",
  fechaEstimadaDespacho: "",
  fechaIngresoPais: "",
  fechaDesalmacenaje: "",
  factura: "",
  partida: "",
  montoCanceladoCRC: "",
  sobranteFaltanteCRC: "",
  estado: "",
  reclamo: "",
};

const CATALOGOS_VACIOS = {
  unidadesSolicitantes: [],
  companiasAdjudicadas: [],
  incoterms: [],
  monedas: ["CRC", "USD", "EUR", "PEN"],
  estados: [ESTADO_INICIAL_PEDIDO],
};

function Campo({
  id,
  etiqueta,
  valor,
  cambiar,
  requerido = false,
  tipo = "text",
  ayuda,
  ...atributos
}) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor={id}>
        {etiqueta}{requerido && <span className="text-danger ms-1" aria-hidden="true">*</span>}
      </label>
      <input
        className="form-control"
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(evento) => cambiar(evento.target.value)}
        required={requerido}
        aria-describedby={ayuda ? `${id}-ayuda` : undefined}
        {...atributos}
      />
      {ayuda && <div className="form-text" id={`${id}-ayuda`}>{ayuda}</div>}
    </div>
  );
}

function CampoFecha({ id, etiqueta, valor, cambiar, requerido = false }) {
  return (
    <Campo
      id={id}
      etiqueta={etiqueta}
      valor={valor}
      cambiar={cambiar}
      requerido={requerido}
      tipo="date"
    />
  );
}

function CampoMoneda({ id, etiqueta, valor, cambiar, moneda, min = "0", max }) {
  return (
    <div className="col-12 col-md-6">
      <label className="form-label" htmlFor={id}>{etiqueta}</label>
      <div className="input-group">
        <span className="input-group-text" aria-hidden="true">{moneda}</span>
        <input
          className="form-control"
          id={id}
          name={id}
          type="number"
          min={min}
          max={max}
          step="0.01"
          value={valor}
          onChange={(evento) => cambiar(evento.target.value)}
        />
      </div>
    </div>
  );
}

function obtenerConsecutivo(valor, expresion) {
  return valor?.match(expresion)?.[1] ?? "";
}

function Frm_SIM_RegistrarImportacion() {
  const { referenciaInterna } = useParams();
  // Restricciones por rol (HU-003): un pedido existente sin IMPORTACION_MODIFICAR es de consulta.
  const puedeModificar = useSesionActual().tieneAlguno(
    referenciaInterna ? [PERMISOS.IMPORTACION_MODIFICAR] : [PERMISOS.IMPORTACION_CREAR]);
  const anoActual = referenciaInterna?.match(/^(\d{4})-\d{3}$/)?.[1] ?? String(new Date().getFullYear());
  const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
  const [catalogos, setCatalogos] = useState(CATALOGOS_VACIOS);
  const [avisoCatalogos, setAvisoCatalogos] = useState("");
  const [error, setError] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(Boolean(referenciaInterna));

  // Un pedido nuevo arranca en el primer estado del catálogo ("Pendiente de pago").
  useEffect(() => {
    if (!referenciaInterna) {
      setFormulario((anterior) => (anterior.estado ? anterior : { ...anterior, estado: catalogos.estados[0] }));
    }
  }, [referenciaInterna, catalogos.estados]);

  // Si el pedido tiene un estado escrito antes de que existiera la lista, se conserva como opción.
  const opcionesEstado = formulario.estado && !catalogos.estados.includes(formulario.estado)
    ? [...catalogos.estados, formulario.estado]
    : catalogos.estados;

  useEffect(() => {
    let vigente = true;
    obtenerCatalogosPedidoImportacion()
      .then((datos) => {
        if (vigente) {
          setCatalogos({
            unidadesSolicitantes: datos.unidadesSolicitantes ?? [],
            companiasAdjudicadas: datos.companiasAdjudicadas ?? [],
            incoterms: datos.incoterms ?? [],
            monedas: datos.monedas ?? CATALOGOS_VACIOS.monedas,
            estados: (datos.estados ?? []).length > 0 ? datos.estados : CATALOGOS_VACIOS.estados,
          });
        }
      })
      .catch((problema) => {
        if (vigente) {
          setAvisoCatalogos(`No se pudieron cargar las sugerencias guardadas. ${problema.message}`);
        }
      });
    return () => { vigente = false; };
  }, []);

  useEffect(() => {
    if (!referenciaInterna) {
      return undefined;
    }
    let vigente = true;
    setCargandoRegistro(true);
    obtenerPedidoImportacion(referenciaInterna)
      .then((detalle) => {
        if (!vigente) {
          return;
        }
        const solicitud = detalle.solicitud;
        setFormulario({
          ...FORMULARIO_VACIO,
          numeroSolicitud: obtenerConsecutivo(detalle.referenciaInterna, /^\d{4}-(\d{3})$/),
          cantidadSolicitada: String(solicitud.cantidadSolicitada ?? ""),
          fechaRecibidoExpediente: solicitud.fechaRecibidoExpediente ?? "",
          unidadSolicitante: solicitud.unidadSolicitante ?? "",
          descripcion: solicitud.descripcion ?? "",
          consecutivoContratacion: obtenerConsecutivo(
            solicitud.numeroContratacion,
            /^\d{4}-CFT-(\d{6}) UADQ-INT$/
          ),
          consecutivoPedido: obtenerConsecutivo(solicitud.numeroPedido, /^(\d{3})-\d{4}$/),
          companiaAdjudicada: solicitud.companiaAdjudicada ?? "",
          consecutivoOrdenCompra: obtenerConsecutivo(solicitud.numeroOrdenCompra, /^\d{4}-(\d{3})$/),
          incoterm: solicitud.incoterm ?? "",
          presupuestoOrdenCRC: String(solicitud.presupuestoOrdenCRC ?? ""),
          montoOrden: String(solicitud.montoOrden ?? ""),
          monedaOrden: solicitud.monedaOrden ?? "CRC",
          saldoDisponible: String(solicitud.saldoDisponible ?? ""),
          fechaRecibidoSpOaf: solicitud.fechaRecibidoSpOaf ?? "",
          fechaRecibidoCopiaChequeUi: solicitud.fechaRecibidoCopiaChequeUi ?? "",
          fechaTransferencia: solicitud.fechaTransferencia ?? "",
          fechaEstimadaDespacho: solicitud.fechaEstimadaDespacho ?? "",
          fechaIngresoPais: solicitud.fechaIngresoPais ?? "",
          fechaDesalmacenaje: solicitud.fechaDesalmacenaje ?? "",
          factura: solicitud.factura ?? "",
          partida: solicitud.partida ? String(solicitud.partida) : "",
          montoCanceladoCRC: String(solicitud.montoCanceladoCRC ?? ""),
          sobranteFaltanteCRC: String(solicitud.sobranteFaltanteCRC ?? ""),
          estado: detalle.estado ?? solicitud.estado ?? "",
          reclamo: solicitud.reclamo ?? "",
        });
      })
      .catch((problema) => {
        if (vigente) {
          setError(`No fue posible cargar el pedido. ${problema.message}`);
        }
      })
      .finally(() => {
        if (vigente) {
          setCargandoRegistro(false);
        }
      });
    return () => { vigente = false; };
  }, [referenciaInterna]);

  const encargado = obtenerSesion()?.nombreCompleto || "Usuario de la sesión";
  const diasTransferencia = useMemo(() => {
    if (!formulario.fechaTransferencia) {
      return null;
    }
    const fechaInicio = new Date(`${formulario.fechaTransferencia}T00:00:00`);
    const fechaHoy = new Date();
    fechaHoy.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((fechaHoy.getTime() - fechaInicio.getTime()) / 86400000));
  }, [formulario.fechaTransferencia]);

  function cambiar(campo, valor) {
    setFormulario((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function cambiarDigitos(campo, longitud, valor) {
    cambiar(campo, valor.replace(/\D/g, "").slice(0, longitud));
  }

  function construirRegistro() {
    const opcional = (valor) => valor.trim() === "" ? null : valor;
    return {
      numeroSolicitud: `${anoActual}-${formulario.numeroSolicitud}`,
      cantidadSolicitada: formulario.cantidadSolicitada,
      fechaRecibidoExpediente: formulario.fechaRecibidoExpediente,
      unidadSolicitante: formulario.unidadSolicitante.trim(),
      descripcion: formulario.descripcion.trim(),
      numeroContratacion:
        `${anoActual}-CFT-${formulario.consecutivoContratacion} UADQ-INT`,
      numeroPedido: `${formulario.consecutivoPedido}-${anoActual}`,
      companiaAdjudicada: formulario.companiaAdjudicada.trim(),
      numeroOrdenCompra: `${anoActual}-${formulario.consecutivoOrdenCompra}`,
      incoterm: formulario.incoterm.trim().toUpperCase(),
      presupuestoOrdenCRC: opcional(formulario.presupuestoOrdenCRC),
      montoOrden: opcional(formulario.montoOrden),
      monedaOrden: formulario.monedaOrden.trim().toUpperCase(),
      saldoDisponible: opcional(formulario.saldoDisponible),
      fechaRecibidoSpOaf: opcional(formulario.fechaRecibidoSpOaf),
      fechaRecibidoCopiaChequeUi: opcional(formulario.fechaRecibidoCopiaChequeUi),
      fechaTransferencia: opcional(formulario.fechaTransferencia),
      fechaEstimadaDespacho: opcional(formulario.fechaEstimadaDespacho),
      fechaIngresoPais: opcional(formulario.fechaIngresoPais),
      fechaDesalmacenaje: opcional(formulario.fechaDesalmacenaje),
      factura: opcional(formulario.factura),
      partida: formulario.partida === "" ? null : Number(formulario.partida),
      montoCanceladoCRC: opcional(formulario.montoCanceladoCRC),
      sobranteFaltanteCRC: opcional(formulario.sobranteFaltanteCRC),
      estado: formulario.estado.trim(),
      reclamo: opcional(formulario.reclamo),
    };
  }

  async function registrar(evento) {
    evento.preventDefault();
    setError("");
    setRespuesta(null);
    if (
      formulario.numeroSolicitud.length !== 3
      || formulario.consecutivoContratacion.length !== 6
      || formulario.consecutivoPedido.length !== 3
      || formulario.consecutivoOrdenCompra.length !== 3
    ) {
      setError("Complete los consecutivos con la cantidad indicada de dígitos.");
      return;
    }

    setEnviando(true);
    try {
      const registro = construirRegistro();
      const resultado = referenciaInterna
        ? await actualizarPedidoImportacion(referenciaInterna, registro)
        : await registrarPedidoImportacion(registro);
      setRespuesta(resultado);
    } catch (problema) {
      setError(`No fue posible registrar el pedido. ${problema.message}`);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Cmp_SIM_Marco usuario={encargado} ayuda={AYUDA}>
      <section className="sim-encabezado p-3 mb-4 shadow-sm">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h1 className="h4 mb-1">
              {referenciaInterna ? `Pedido de importación ${referenciaInterna}` : "Registro de pedido de importación"}
            </h1>
            <p className="mb-0 small text-muted">
              Registre el pedido y complete los datos de seguimiento cuando estén disponibles.
            </p>
          </div>
          <Link className="btn btn-outline-secondary" to="/tramites/importaciones">
            Volver a pedidos
          </Link>
        </div>
      </section>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {avisoCatalogos && <div className="alert alert-warning" role="status">{avisoCatalogos}</div>}
      {respuesta && (
        <div className="alert alert-success" role="status">
          <strong>{respuesta.mensaje}</strong>
          <div>Pedido {respuesta.referenciaInterna} · Estado: {respuesta.estado}</div>
          {!referenciaInterna && (
            <Link
              className="alert-link d-inline-block mt-2"
              to={`/tramites/importaciones/${encodeURIComponent(respuesta.referenciaInterna)}`}
            >
              Continuar completando el expediente
            </Link>
          )}
        </div>
      )}
      {cargandoRegistro && <div className="alert alert-info" role="status">Cargando pedido...</div>}
      {!puedeModificar && (
        <Cmp_SIM_AvisoSoloConsulta texto={"Usted puede consultar este pedido, pero sus roles no le permiten "
          + "modificarlo. Si lo necesita, solicite el rol correspondiente a la jefatura de la Unidad."} />
      )}

      <form className="card sim-card shadow-sm" onSubmit={registrar}>
        <div className="card-header">
          <i className="bi bi-box-seam me-2" aria-hidden="true"></i>
          Datos del pedido
        </div>
        <div className="card-body">
          <fieldset disabled={!puedeModificar}>
            <section className="mb-4" aria-labelledby="titulo-solicitud">
              <h2 className="h6 border-bottom pb-2 mb-3" id="titulo-solicitud">Solicitud y expediente</h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="numeroSolicitud">
                    Número de solicitud <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{anoActual}-</span>
                    <input
                      className="form-control"
                      id="numeroSolicitud"
                      inputMode="numeric"
                      pattern="[0-9]{3}"
                      maxLength={3}
                      placeholder="001"
                      required
                      value={formulario.numeroSolicitud}
                      onChange={(evento) => cambiarDigitos("numeroSolicitud", 3, evento.target.value)}
                    />
                  </div>
                </div>
                <Campo
                  id="cantidadSolicitada"
                  etiqueta="Cantidad solicitada"
                  tipo="number"
                  min="0.001"
                  step="0.001"
                  valor={formulario.cantidadSolicitada}
                  cambiar={(valor) => cambiar("cantidadSolicitada", valor)}
                  requerido
                />
                <CampoFecha
                  id="fechaRecibidoExpediente"
                  etiqueta="Fecha de recibido del expediente"
                  valor={formulario.fechaRecibidoExpediente}
                  cambiar={(valor) => cambiar("fechaRecibidoExpediente", valor)}
                  requerido
                />
                <Campo
                  id="unidadSolicitante"
                  etiqueta="Unidad solicitante"
                  valor={formulario.unidadSolicitante}
                  cambiar={(valor) => cambiar("unidadSolicitante", valor)}
                  requerido
                  maxLength={120}
                  list="unidades-solicitantes"
                  ayuda="Puede seleccionar una sugerencia o escribir una unidad nueva."
                />
                <datalist id="unidades-solicitantes">
                  {catalogos.unidadesSolicitantes.map((valor) => <option value={valor} key={valor} />)}
                </datalist>
                <div className="col-12">
                  <label className="form-label" htmlFor="descripcion">
                    Descripción <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    rows={3}
                    maxLength={4000}
                    required
                    value={formulario.descripcion}
                    onChange={(evento) => cambiar("descripcion", evento.target.value)}
                  />
                </div>
              </div>
            </section>

            <section className="mb-4" aria-labelledby="titulo-contractual">
              <h2 className="h6 border-bottom pb-2 mb-3" id="titulo-contractual">
                Contratación y orden de compra
              </h2>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="consecutivoContratacion">
                    Contratación No. <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{anoActual}-CFT-</span>
                    <input
                      className="form-control"
                      id="consecutivoContratacion"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      placeholder="000002"
                      required
                      value={formulario.consecutivoContratacion}
                      onChange={(evento) => cambiarDigitos("consecutivoContratacion", 6, evento.target.value)}
                    />
                    <span className="input-group-text"> UADQ-INT</span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="consecutivoPedido">
                    Pedido No. <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <div className="input-group">
                    <input
                      className="form-control"
                      id="consecutivoPedido"
                      inputMode="numeric"
                      pattern="[0-9]{3}"
                      maxLength={3}
                      placeholder="001"
                      required
                      value={formulario.consecutivoPedido}
                      onChange={(evento) => cambiarDigitos("consecutivoPedido", 3, evento.target.value)}
                    />
                    <span className="input-group-text">-{anoActual}</span>
                  </div>
                </div>
                <Campo
                  id="companiaAdjudicada"
                  etiqueta="Compañía adjudicada"
                  valor={formulario.companiaAdjudicada}
                  cambiar={(valor) => cambiar("companiaAdjudicada", valor)}
                  requerido
                  maxLength={160}
                  list="companias-adjudicadas"
                  ayuda="Puede seleccionar una compañía guardada o agregar una nueva."
                />
                <datalist id="companias-adjudicadas">
                  {catalogos.companiasAdjudicadas.map((valor) => <option value={valor} key={valor} />)}
                </datalist>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="consecutivoOrdenCompra">
                    Número de orden de compra <span className="text-danger" aria-hidden="true">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{anoActual}-</span>
                    <input
                      className="form-control"
                      id="consecutivoOrdenCompra"
                      inputMode="numeric"
                      pattern="[0-9]{3}"
                      maxLength={3}
                      placeholder="001"
                      required
                      value={formulario.consecutivoOrdenCompra}
                      onChange={(evento) => cambiarDigitos("consecutivoOrdenCompra", 3, evento.target.value)}
                    />
                  </div>
                </div>
                <Campo
                  id="incoterm"
                  etiqueta="Incoterm"
                  valor={formulario.incoterm}
                  cambiar={(valor) => cambiar("incoterm", valor.toUpperCase())}
                  maxLength={10}
                  list="incoterms-guardados"
                  ayuda="Siglas en mayúscula; puede agregar una nueva."
                />
                <datalist id="incoterms-guardados">
                  {catalogos.incoterms.map((valor) => <option value={valor} key={valor} />)}
                </datalist>
              </div>
            </section>

            <section className="mb-4" aria-labelledby="titulo-montos">
              <h2 className="h6 border-bottom pb-2 mb-3" id="titulo-montos">Montos</h2>
              <div className="row g-3">
                <CampoMoneda
                  id="presupuestoOrdenCRC"
                  etiqueta="Presupuesto de la orden (colones)"
                  valor={formulario.presupuestoOrdenCRC}
                  cambiar={(valor) => cambiar("presupuestoOrdenCRC", valor)}
                  moneda="₡"
                  max="50000000"
                />
                <div className="col-12 col-md-6">
                  <div className="d-flex justify-content-between">
                    <label className="form-label" htmlFor="montoOrden">Monto de la orden de compra</label>
                    <label className="form-label small" htmlFor="monedaOrden">
                      Moneda <span className="text-danger" aria-hidden="true">*</span>
                    </label>
                  </div>
                  <div className="input-group">
                    <input
                      className="form-control"
                      id="montoOrden"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formulario.montoOrden}
                      onChange={(evento) => cambiar("montoOrden", evento.target.value)}
                    />
                    <input
                      className="form-control"
                      id="monedaOrden"
                      list="monedas-importacion"
                      maxLength={30}
                      required
                      value={formulario.monedaOrden}
                      onChange={(evento) => cambiar("monedaOrden", evento.target.value.toUpperCase())}
                    />
                  </div>
                  <datalist id="monedas-importacion">
                    {catalogos.monedas.map((valor) => <option value={valor} key={valor} />)}
                  </datalist>
                  <div className="form-text">CRC, USD, EUR, PEN u otra moneda.</div>
                </div>
                <CampoMoneda
                  id="saldoDisponible"
                  etiqueta="Saldo disponible (opcional)"
                  valor={formulario.saldoDisponible}
                  cambiar={(valor) => cambiar("saldoDisponible", valor)}
                  moneda={formulario.monedaOrden}
                />
                <CampoMoneda
                  id="montoCanceladoCRC"
                  etiqueta="Monto cancelado (colones)"
                  valor={formulario.montoCanceladoCRC}
                  cambiar={(valor) => cambiar("montoCanceladoCRC", valor)}
                  moneda="₡"
                />
                <CampoMoneda
                  id="sobranteFaltanteCRC"
                  etiqueta="Sobrante o faltante de la orden (colones)"
                  valor={formulario.sobranteFaltanteCRC}
                  cambiar={(valor) => cambiar("sobranteFaltanteCRC", valor)}
                  moneda="₡"
                  min="-9999999999999.99"
                  max="9999999999999.99"
                />
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="partida">Partida</label>
                  <select
                    className="form-select"
                    id="partida"
                    value={formulario.partida}
                    onChange={(evento) => cambiar("partida", evento.target.value)}
                  >
                    <option value="">Seleccione 2 o 5</option>
                    <option value="2">2</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="mb-4" aria-labelledby="titulo-fechas">
              <h2 className="h6 border-bottom pb-2 mb-3" id="titulo-fechas">Seguimiento y fechas</h2>
              <div className="row g-3">
                <CampoFecha
                  id="fechaRecibidoSpOaf"
                  etiqueta="Fecha de recibido de SP en OAF"
                  valor={formulario.fechaRecibidoSpOaf}
                  cambiar={(valor) => cambiar("fechaRecibidoSpOaf", valor)}
                />
                <CampoFecha
                  id="fechaRecibidoCopiaChequeUi"
                  etiqueta="Fecha de recibido de copia de cheque UI"
                  valor={formulario.fechaRecibidoCopiaChequeUi}
                  cambiar={(valor) => cambiar("fechaRecibidoCopiaChequeUi", valor)}
                />
                <CampoFecha
                  id="fechaTransferencia"
                  etiqueta="Fecha de realizada la transferencia"
                  valor={formulario.fechaTransferencia}
                  cambiar={(valor) => cambiar("fechaTransferencia", valor)}
                />
                <CampoFecha
                  id="fechaEstimadaDespacho"
                  etiqueta="Fecha estimada de despacho"
                  valor={formulario.fechaEstimadaDespacho}
                  cambiar={(valor) => cambiar("fechaEstimadaDespacho", valor)}
                />
                <CampoFecha
                  id="fechaIngresoPais"
                  etiqueta="Fecha de ingreso al país"
                  valor={formulario.fechaIngresoPais}
                  cambiar={(valor) => cambiar("fechaIngresoPais", valor)}
                />
                <CampoFecha
                  id="fechaDesalmacenaje"
                  etiqueta="Fecha de desalmacenaje"
                  valor={formulario.fechaDesalmacenaje}
                  cambiar={(valor) => cambiar("fechaDesalmacenaje", valor)}
                />
                {diasTransferencia !== null && (
                  <div className="col-12">
                    <div className={`alert ${diasTransferencia >= 3 ? "alert-warning" : "alert-info"} mb-0`}
                         role="status">
                      Días calendario desde la transferencia: <strong>{diasTransferencia}</strong>.
                      {diasTransferencia >= 3 && " Revise el pago; se mostrará en el panel de notificaciones."}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="mb-4" aria-labelledby="titulo-adicional">
              <h2 className="h6 border-bottom pb-2 mb-3" id="titulo-adicional">Datos adicionales</h2>
              <div className="row g-3">
                <Campo id="factura" etiqueta="Factura" valor={formulario.factura}
                       cambiar={(valor) => cambiar("factura", valor)} maxLength={100} />
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="estado">
                    Estado del pedido<span className="text-danger ms-1" aria-hidden="true">*</span>
                  </label>
                  <select className="form-select" id="estado" name="estado" required
                          aria-describedby="estado-ayuda"
                          value={formulario.estado}
                          onChange={(evento) => cambiar("estado", evento.target.value)}>
                    {opcionesEstado.map((opcion) => <option value={opcion} key={opcion}>{opcion}</option>)}
                  </select>
                  <div className="form-text" id="estado-ayuda">
                    El pedido inicia en {ESTADO_INICIAL_PEDIDO}, mientras se tramita el pago ante la OAF.
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label" htmlFor="encargado">Encargado</label>
                  <input className="form-control" id="encargado" value={encargado} readOnly />
                  <div className="form-text">Se asigna desde el inicio de sesión.</div>
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="reclamo">Reclamo</label>
                  <textarea
                    className="form-control"
                    id="reclamo"
                    rows={2}
                    maxLength={2000}
                    value={formulario.reclamo}
                    onChange={(evento) => cambiar("reclamo", evento.target.value)}
                  />
                </div>
              </div>
            </section>

          </fieldset>

          {puedeModificar && (
            <div className="d-flex flex-wrap justify-content-end gap-2">
              {!referenciaInterna && (
                <button className="btn btn-outline-secondary" type="reset"
                        onClick={() => {
                          setFormulario({ ...FORMULARIO_VACIO, estado: catalogos.estados[0] });
                          setRespuesta(null);
                          setError("");
                        }}>
                  Limpiar
                </button>
              )}
              <button className="btn btn-sim" type="submit" disabled={enviando || cargandoRegistro}>
                {enviando ? "Guardando..." : referenciaInterna ? "Guardar cambios" : "Registrar pedido"}
              </button>
            </div>
          )}
        </div>
      </form>
    </Cmp_SIM_Marco>
  );
}

export default Frm_SIM_RegistrarImportacion;
