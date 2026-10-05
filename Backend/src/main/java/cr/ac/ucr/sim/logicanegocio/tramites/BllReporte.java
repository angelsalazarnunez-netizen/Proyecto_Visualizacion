package cr.ac.ucr.sim.logicanegocio.tramites;

import cr.ac.ucr.sim.accesodatos.tramites.DalReporte;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntFiltroReporte;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntLineaReporte;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntReporteConsultas;
import cr.ac.ucr.sim.entidadnegocio.tramites.EntTramiteReporte;
import cr.ac.ucr.sim.logicanegocio.autenticacion.ExcepcionNegocio;
import cr.ac.ucr.sim.utilerias.Constantes;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 25/09/2026
 * Descripción: Reglas de negocio del reporte de consultas internas (HU-036). Resume los trámites
 *   que cumplen los filtros: cuenta los expedientes, suma el valor CIF por moneda, cuenta los
 *   permisos regulatorios y desglosa por tipo de trámite y por régimen aduanero. Los montos de
 *   monedas distintas no se suman entre sí, porque el sistema no registra tipo de cambio.
 *
 * Historial de cambios:
 *   25/09/2026 Katherine Susana Valverde Fallas: creación de la clase.
 */
@Service
public class BllReporte {

    /** Criterios de agrupación que admite el reporte. */
    public static final Set<String> AGRUPACIONES = Set.of(
            Constantes.AGRUPACION_TIPO_TRAMITE,
            Constantes.AGRUPACION_REGIMEN_ADUANERO,
            Constantes.AGRUPACION_DEPENDENCIA,
            Constantes.AGRUPACION_PARTIDO_RESPONSABLE,
            Constantes.AGRUPACION_TIPO_EXONERACION,
            Constantes.AGRUPACION_MES);

    private static final DateTimeFormatter FORMATO_MES = DateTimeFormatter.ofPattern("yyyy-MM");

    private final DalReporte vgo_DalReporte;

    public BllReporte(DalReporte pvo_DalReporte) {
        this.vgo_DalReporte = pvo_DalReporte;
    }

    /**
     * Autor: Katherine Susana Valverde Fallas
     * Fecha: 25/09/2026
     * Descripción: Genera el reporte tabulado de consultas internas con los criterios indicados.
     *
     * @param pvo_Filtro rango de fechas, filtros y criterio de agrupación
     * @return reporte con la cantidad de trámites, los totales y los desgloses
     */
    @Transactional(readOnly = true)
    public EntReporteConsultas Generar(EntFiltroReporte pvo_Filtro) {
        if (pvo_Filtro == null) {
            throw new ExcepcionNegocio(Constantes.MENSAJE_DATOS_INCOMPLETOS);
        }

        String vlc_AgruparPor = pvo_Filtro.getAgruparPor() == null
                ? Constantes.AGRUPACION_TIPO_TRAMITE
                : pvo_Filtro.getAgruparPor().trim().toUpperCase();
        if (!AGRUPACIONES.contains(vlc_AgruparPor)) {
            throw new ExcepcionNegocio(Constantes.MENSAJE_AGRUPACION_INVALIDA);
        }
        if (pvo_Filtro.getFechaDesde() != null && pvo_Filtro.getFechaHasta() != null
                && pvo_Filtro.getFechaHasta().isBefore(pvo_Filtro.getFechaDesde())) {
            throw new ExcepcionNegocio(Constantes.MENSAJE_RANGO_DE_FECHAS_INVALIDO);
        }

        List<EntTramiteReporte> vlo_LsTramites = this.vgo_DalReporte.SIMT_TRAMITE_ObtenerListaReporte(
                pvo_Filtro,
                Constantes.CODIGO_TIPO_DOCUMENTO_PERMISO_REGULATORIO,
                Constantes.ESTADO_DOCUMENTO_ACTIVO);

        EntReporteConsultas vlo_Reporte = new EntReporteConsultas();
        vlo_Reporte.setFechaGeneracion(LocalDateTime.now());
        vlo_Reporte.setAgrupadoPor(vlc_AgruparPor);
        vlo_Reporte.setCantidadTramites(vlo_LsTramites.size());
        vlo_Reporte.setCantidadPermisos(vlo_LsTramites.stream()
                .mapToLong(vlo_Tramite -> vlo_Tramite.getCantidadPermisos() == null
                        ? 0L : vlo_Tramite.getCantidadPermisos())
                .sum());
        vlo_Reporte.setAgrupacion(this.Resumir(vlo_LsTramites, this.ObtenerClave(vlc_AgruparPor)));
        vlo_Reporte.setPorTipoTramite(this.Resumir(vlo_LsTramites,
                this.ObtenerClave(Constantes.AGRUPACION_TIPO_TRAMITE)));
        vlo_Reporte.setPorRegimenAduanero(this.Resumir(vlo_LsTramites,
                this.ObtenerClave(Constantes.AGRUPACION_REGIMEN_ADUANERO)));
        if (pvo_Filtro.isEnumerarTramites()) {
            vlo_Reporte.setTramites(vlo_LsTramites);
        }
        vlo_Reporte.setNotas(this.ArmarNotas());
        return vlo_Reporte;
    }

    /**
     * Autor: Katherine Susana Valverde Fallas
     * Fecha: 25/09/2026
     * Descripción: Resume los trámites por el criterio indicado y por moneda, de modo que cada
     *   línea del reporte lleva su cantidad de trámites, su total CIF y sus permisos.
     *
     * @param pvo_LsTramites trámites que cumplen los filtros
     * @param pvo_Clave función que obtiene el grupo de cada trámite
     * @return líneas del reporte, ordenadas por grupo y moneda
     */
    private List<EntLineaReporte> Resumir(
            List<EntTramiteReporte> pvo_LsTramites,
            Function<EntTramiteReporte, String> pvo_Clave) {

        Map<String, EntLineaReporte> vlo_MpLineas = new LinkedHashMap<>();
        for (EntTramiteReporte vlo_Tramite : pvo_LsTramites) {
            String vlc_Grupo = pvo_Clave.apply(vlo_Tramite);
            String vlc_Moneda = vlo_Tramite.getMoneda() == null
                    ? Constantes.MONEDA_NO_DECLARADA : vlo_Tramite.getMoneda();
            EntLineaReporte vlo_Linea = vlo_MpLineas.computeIfAbsent(vlc_Grupo + "|" + vlc_Moneda,
                    vlc_Llave -> {
                        EntLineaReporte vlo_Nueva = new EntLineaReporte();
                        vlo_Nueva.setGrupo(vlc_Grupo);
                        vlo_Nueva.setMoneda(vlc_Moneda);
                        vlo_Nueva.setTotalCif(BigDecimal.ZERO);
                        vlo_Nueva.setTotalImpuestosPagados(BigDecimal.ZERO);
                        vlo_Nueva.setTotalImpuestosExonerados(BigDecimal.ZERO);
                        vlo_Nueva.setTotalBodegaje(BigDecimal.ZERO);
                        return vlo_Nueva;
                    });
            vlo_Linea.setCantidadTramites(vlo_Linea.getCantidadTramites() + 1);
            vlo_Linea.setCantidadPermisos(vlo_Linea.getCantidadPermisos()
                    + (vlo_Tramite.getCantidadPermisos() == null ? 0L : vlo_Tramite.getCantidadPermisos()));
            if (vlo_Tramite.getValorCif() != null) {
                vlo_Linea.setTotalCif(vlo_Linea.getTotalCif().add(vlo_Tramite.getValorCif()));
            }
            if (vlo_Tramite.getImpuestosPagados() != null) {
                vlo_Linea.setTotalImpuestosPagados(
                        vlo_Linea.getTotalImpuestosPagados().add(vlo_Tramite.getImpuestosPagados()));
            }
            if (vlo_Tramite.getImpuestosExonerados() != null) {
                vlo_Linea.setTotalImpuestosExonerados(
                        vlo_Linea.getTotalImpuestosExonerados()
                                .add(vlo_Tramite.getImpuestosExonerados()));
            }
            if (vlo_Tramite.getMontoBodegaje() != null) {
                vlo_Linea.setTotalBodegaje(
                        vlo_Linea.getTotalBodegaje().add(vlo_Tramite.getMontoBodegaje()));
            }
        }

        List<EntLineaReporte> vlo_LsLineas = new ArrayList<>(vlo_MpLineas.values());
        vlo_LsLineas.sort(Comparator.comparing(EntLineaReporte::getGrupo)
                .thenComparing(EntLineaReporte::getMoneda));
        return vlo_LsLineas;
    }

    private Function<EntTramiteReporte, String> ObtenerClave(String pvc_AgruparPor) {
        return switch (pvc_AgruparPor) {
            case Constantes.AGRUPACION_REGIMEN_ADUANERO ->
                    vlo_Tramite -> this.Describir(vlo_Tramite.getRegimenAduanero());
            case Constantes.AGRUPACION_DEPENDENCIA ->
                    vlo_Tramite -> this.Describir(vlo_Tramite.getOrigenDependencia());
            case Constantes.AGRUPACION_PARTIDO_RESPONSABLE ->
                    vlo_Tramite -> this.Describir(vlo_Tramite.getPartidoResponsable());
            case Constantes.AGRUPACION_TIPO_EXONERACION ->
                    vlo_Tramite -> this.Describir(vlo_Tramite.getTipoExoneracion());
            case Constantes.AGRUPACION_MES ->
                    vlo_Tramite -> vlo_Tramite.getFechaCreacion() == null
                            ? Constantes.DATO_NO_REGISTRADO
                            : vlo_Tramite.getFechaCreacion().format(FORMATO_MES);
            default -> vlo_Tramite -> this.Describir(vlo_Tramite.getTipoTramite());
        };
    }

    private String Describir(String pvc_Dato) {
        return pvc_Dato == null || pvc_Dato.isBlank() ? Constantes.DATO_NO_REGISTRADO : pvc_Dato;
    }

    private List<String> ArmarNotas() {
        List<String> vlo_LsNotas = new ArrayList<>();
        vlo_LsNotas.add(Constantes.NOTA_REPORTE_MONEDAS);
        vlo_LsNotas.add(Constantes.NOTA_REPORTE_MONTOS_PENDIENTES);
        return vlo_LsNotas;
    }
}
