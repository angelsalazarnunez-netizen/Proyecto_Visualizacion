package cr.ac.ucr.sim.entidadnegocio.tramites;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 25/09/2026
 * Descripción: Reporte de consultas internas (HU-036). Reúne la cantidad de trámites, los totales
 *   por moneda y los desgloses por tipo de trámite y por régimen aduanero, junto con la lista de
 *   trámites cuando se pide enumerarlos. Las notas advierten qué montos todavía no registra el
 *   sistema, para que el reporte no se lea como si valieran cero.
 */
public class EntReporteConsultas {

    private LocalDateTime vgd_FechaGeneracion;
    private String vgc_AgrupadoPor;
    private long vgn_CantidadTramites;
    private long vgn_CantidadPermisos;
    private List<EntLineaReporte> vgo_LsAgrupacion = new ArrayList<>();
    private List<EntLineaReporte> vgo_LsPorTipoTramite = new ArrayList<>();
    private List<EntLineaReporte> vgo_LsPorRegimenAduanero = new ArrayList<>();
    private List<EntTramiteReporte> vgo_LsTramites = new ArrayList<>();
    private List<String> vgo_LsNotas = new ArrayList<>();

    @JsonProperty("fechaGeneracion")
    public LocalDateTime getFechaGeneracion() {
        return this.vgd_FechaGeneracion;
    }

    public void setFechaGeneracion(LocalDateTime pvd_FechaGeneracion) {
        this.vgd_FechaGeneracion = pvd_FechaGeneracion;
    }

    @JsonProperty("agrupadoPor")
    public String getAgrupadoPor() {
        return this.vgc_AgrupadoPor;
    }

    public void setAgrupadoPor(String pvc_AgrupadoPor) {
        this.vgc_AgrupadoPor = pvc_AgrupadoPor;
    }

    @JsonProperty("cantidadTramites")
    public long getCantidadTramites() {
        return this.vgn_CantidadTramites;
    }

    public void setCantidadTramites(long pvn_CantidadTramites) {
        this.vgn_CantidadTramites = pvn_CantidadTramites;
    }

    @JsonProperty("cantidadPermisos")
    public long getCantidadPermisos() {
        return this.vgn_CantidadPermisos;
    }

    public void setCantidadPermisos(long pvn_CantidadPermisos) {
        this.vgn_CantidadPermisos = pvn_CantidadPermisos;
    }

    @JsonProperty("agrupacion")
    public List<EntLineaReporte> getAgrupacion() {
        return this.vgo_LsAgrupacion;
    }

    public void setAgrupacion(List<EntLineaReporte> pvo_LsAgrupacion) {
        this.vgo_LsAgrupacion = pvo_LsAgrupacion;
    }

    @JsonProperty("porTipoTramite")
    public List<EntLineaReporte> getPorTipoTramite() {
        return this.vgo_LsPorTipoTramite;
    }

    public void setPorTipoTramite(List<EntLineaReporte> pvo_LsPorTipoTramite) {
        this.vgo_LsPorTipoTramite = pvo_LsPorTipoTramite;
    }

    @JsonProperty("porRegimenAduanero")
    public List<EntLineaReporte> getPorRegimenAduanero() {
        return this.vgo_LsPorRegimenAduanero;
    }

    public void setPorRegimenAduanero(List<EntLineaReporte> pvo_LsPorRegimenAduanero) {
        this.vgo_LsPorRegimenAduanero = pvo_LsPorRegimenAduanero;
    }

    @JsonProperty("tramites")
    public List<EntTramiteReporte> getTramites() {
        return this.vgo_LsTramites;
    }

    public void setTramites(List<EntTramiteReporte> pvo_LsTramites) {
        this.vgo_LsTramites = pvo_LsTramites;
    }

    @JsonProperty("notas")
    public List<String> getNotas() {
        return this.vgo_LsNotas;
    }

    public void setNotas(List<String> pvo_LsNotas) {
        this.vgo_LsNotas = pvo_LsNotas;
    }
}
