package cr.ac.ucr.sim.entidadnegocio.tramites;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 15/09/2026
 * Descripción: Expediente completo de una solicitud de exoneración: sus datos, su documentación,
 *   los documentos obligatorios que siguen pendientes y su bitácora.
 */
public class EntExoneracionDetalle {

    private String vgc_ReferenciaInterna;
    private String vgc_Estado;
    private String vgc_TipoExoneracion;
    private String vgc_NumeroContratacion;
    private String vgc_OrdenCompraGeco;
    private String vgc_ContratoSicop;
    private String vgc_NumeroExonet;
    private String vgc_NumeroAutorizacionExonet;
    private String vgc_Observaciones;
    private String vgc_UsuarioResponsable;
    private LocalDateTime vgd_FechaCreacion;
    private List<EntDocumentoExpediente> vgo_LsDocumentos = new ArrayList<>();
    private List<String> vgo_LsDocumentosPendientes = new ArrayList<>();
    private List<EntMovimientoBitacora> vgo_LsBitacora = new ArrayList<>();

    @JsonProperty("referenciaInterna")
    public String getReferenciaInterna() {
        return this.vgc_ReferenciaInterna;
    }

    public void setReferenciaInterna(String pvc_ReferenciaInterna) {
        this.vgc_ReferenciaInterna = pvc_ReferenciaInterna;
    }

    @JsonProperty("estado")
    public String getEstado() {
        return this.vgc_Estado;
    }

    public void setEstado(String pvc_Estado) {
        this.vgc_Estado = pvc_Estado;
    }

    @JsonProperty("tipoExoneracion")
    public String getTipoExoneracion() {
        return this.vgc_TipoExoneracion;
    }

    public void setTipoExoneracion(String pvc_TipoExoneracion) {
        this.vgc_TipoExoneracion = pvc_TipoExoneracion;
    }

    @JsonProperty("numeroContratacion")
    public String getNumeroContratacion() {
        return this.vgc_NumeroContratacion;
    }

    public void setNumeroContratacion(String pvc_NumeroContratacion) {
        this.vgc_NumeroContratacion = pvc_NumeroContratacion;
    }

    @JsonProperty("ordenCompraGeco")
    public String getOrdenCompraGeco() {
        return this.vgc_OrdenCompraGeco;
    }

    public void setOrdenCompraGeco(String pvc_OrdenCompraGeco) {
        this.vgc_OrdenCompraGeco = pvc_OrdenCompraGeco;
    }

    @JsonProperty("contratoSicop")
    public String getContratoSicop() {
        return this.vgc_ContratoSicop;
    }

    public void setContratoSicop(String pvc_ContratoSicop) {
        this.vgc_ContratoSicop = pvc_ContratoSicop;
    }

    @JsonProperty("observaciones")
    public String getObservaciones() {
        return this.vgc_Observaciones;
    }

    public void setObservaciones(String pvc_Observaciones) {
        this.vgc_Observaciones = pvc_Observaciones;
    }

    @JsonProperty("usuarioResponsable")
    public String getUsuarioResponsable() {
        return this.vgc_UsuarioResponsable;
    }

    public void setUsuarioResponsable(String pvc_UsuarioResponsable) {
        this.vgc_UsuarioResponsable = pvc_UsuarioResponsable;
    }

    @JsonProperty("fechaCreacion")
    public LocalDateTime getFechaCreacion() {
        return this.vgd_FechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime pvd_FechaCreacion) {
        this.vgd_FechaCreacion = pvd_FechaCreacion;
    }

    @JsonProperty("documentos")
    public List<EntDocumentoExpediente> getDocumentos() {
        return this.vgo_LsDocumentos;
    }

    public void setDocumentos(List<EntDocumentoExpediente> pvo_LsDocumentos) {
        this.vgo_LsDocumentos = pvo_LsDocumentos;
    }

    @JsonProperty("documentosPendientes")
    public List<String> getDocumentosPendientes() {
        return this.vgo_LsDocumentosPendientes;
    }

    public void setDocumentosPendientes(List<String> pvo_LsDocumentosPendientes) {
        this.vgo_LsDocumentosPendientes = pvo_LsDocumentosPendientes;
    }

    @JsonProperty("bitacora")
    public List<EntMovimientoBitacora> getBitacora() {
        return this.vgo_LsBitacora;
    }

    public void setBitacora(List<EntMovimientoBitacora> pvo_LsBitacora) {
        this.vgo_LsBitacora = pvo_LsBitacora;
    }

    public String getNumeroExonet() {
        return this.vgc_NumeroExonet;
    }

    public void setNumeroExonet(String pvc_NumeroExonet) {
        this.vgc_NumeroExonet = pvc_NumeroExonet;
    }

    public String getNumeroAutorizacionExonet() {
        return this.vgc_NumeroAutorizacionExonet;
    }

    public void setNumeroAutorizacionExonet(String pvc_NumeroAutorizacionExonet) {
        this.vgc_NumeroAutorizacionExonet = pvc_NumeroAutorizacionExonet;
    }
}
