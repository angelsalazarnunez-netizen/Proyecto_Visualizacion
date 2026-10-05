import { Cmp_SIM_AyudaCampo } from "./Cmp_SIM_Ayuda.jsx";

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 22/09/2026
 * Descripción: Documentación de un expediente. Muestra un campo por tipo de documento, indica
 *   cuáles son obligatorios y cuáles ya se adjuntaron, y avisa lo que queda pendiente. Se usa
 *   tanto en el registro de la solicitud de exoneración (HU-018) como en el desalmacenaje
 *   especial (HU-031), que admite documentación atípica.
 */
function Cmp_SIM_Documentos({ documentos, archivos, alCambiar }) {
  function alSeleccionar(codigo, listaArchivos) {
    alCambiar({ ...archivos, [codigo]: [...listaArchivos] });
  }

  return (
    <div className="row g-3">
      {documentos.map((documento) => {
        const seleccionados = archivos[documento.codigo] ?? [];
        const pendiente = documento.obligatorio && seleccionados.length === 0;
        const identificador = `fil${documento.codigo.charAt(0).toUpperCase()}${documento.codigo.slice(1)}`;

        return (
          <div className="col-12 col-md-6" key={documento.codigo}>
            <div className="d-flex justify-content-between align-items-center">
              <label className="form-label mb-1" htmlFor={identificador}>
                {documento.nombre}
                {documento.obligatorio
                  ? <span className="text-danger"> *</span>
                  : <span className="sim-opcional"> (si aplica)</span>}
                {documento.ayuda && (
                  <Cmp_SIM_AyudaCampo titulo={documento.nombre}>{documento.ayuda}</Cmp_SIM_AyudaCampo>
                )}
              </label>

              <span className={`badge ${pendiente ? "text-bg-warning" : seleccionados.length > 0
                ? "text-bg-success" : "text-bg-light text-dark"}`}>
                {pendiente ? "Pendiente" : seleccionados.length > 0
                  ? `${seleccionados.length} archivo(s)` : "Opcional"}
              </span>
            </div>

            <input
              type="file"
              className="form-control"
              id={identificador}
              multiple={Boolean(documento.multiple)}
              onChange={(evento) => alSeleccionar(documento.codigo, evento.target.files)}
            />

            <Cmp_SIM_ListaArchivos
              archivos={seleccionados}
              alQuitar={(indice) => alCambiar({
                ...archivos,
                [documento.codigo]: seleccionados.filter((_, posicion) => posicion !== indice),
              })}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Archivos seleccionados que todavía no se han guardado. Se pueden quitar de la lista: como el
 * expediente aún no los tiene, basta con retirarlos antes de guardar.
 */
export function Cmp_SIM_ListaArchivos({ archivos, alQuitar }) {
  return (
    <ul className="sim-archivos">
      {(archivos ?? []).map((archivo, indice) => (
        <li className="d-flex justify-content-between align-items-center" key={`${archivo.name}-${indice}`}>
          <span>{archivo.name}</span>
          <button type="button" className="btn btn-link btn-sm text-danger p-0 ms-2"
                  aria-label={`Quitar ${archivo.name}`}
                  onClick={() => alQuitar(indice)}>
            Quitar
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Devuelve los documentos obligatorios que todavía no se han adjuntado. */
export function obtenerPendientes(documentos, archivos) {
  return documentos.filter(
    (documento) => documento.obligatorio && (archivos[documento.codigo] ?? []).length === 0
  );
}

/** Cuenta todos los archivos seleccionados. */
export function contarArchivos(archivos) {
  return Object.values(archivos).reduce((total, lista) => total + (lista?.length ?? 0), 0);
}

export default Cmp_SIM_Documentos;
