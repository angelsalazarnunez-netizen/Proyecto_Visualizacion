package cr.ac.ucr.sim.entidadnegocio.autenticacion;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 10/09/2026
 * Descripción: Entidad de negocio de SIMF_USUARIO. Incluye los datos necesarios para identificar
 *   a la persona responsable de un trámite y validar el inicio de sesión.
 */
@Entity
@Table(name = "SIMF_USUARIO")
public class EntUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_USUARIO")
    private Integer vgn_IdUsuario;

    @Column(name = "NOMBRE_COMPLETO", nullable = false, length = 150)
    private String vgc_NombreCompleto;

    @Column(name = "CORREO_INSTITUCIONAL", nullable = false, length = 120)
    private String vgc_CorreoInstitucional;

    @Column(name = "CONTRASENA_HASH", nullable = false, length = 255)
    private String vgc_ContrasenaHash;

    @Column(name = "ESTADO_VALIDACION", nullable = false, length = 3)
    private String vgc_EstadoValidacion;

    @Column(name = "ESTADO_ROL", nullable = false, length = 3)
    private String vgc_EstadoRol;

    @JsonProperty("idUsuario")
    public Integer getIdUsuario() {
        return this.vgn_IdUsuario;
    }

    public void setIdUsuario(Integer pvn_IdUsuario) {
        this.vgn_IdUsuario = pvn_IdUsuario;
    }

    @JsonProperty("nombreCompleto")
    public String getNombreCompleto() {
        return this.vgc_NombreCompleto;
    }

    public void setNombreCompleto(String pvc_NombreCompleto) {
        this.vgc_NombreCompleto = pvc_NombreCompleto;
    }

    @JsonProperty("correoInstitucional")
    public String getCorreoInstitucional() {
        return this.vgc_CorreoInstitucional;
    }

    public void setCorreoInstitucional(String pvc_CorreoInstitucional) {
        this.vgc_CorreoInstitucional = pvc_CorreoInstitucional;
    }

    @JsonIgnore
    public String getContrasenaHash() {
        return this.vgc_ContrasenaHash;
    }

    public void setContrasenaHash(String pvc_ContrasenaHash) {
        this.vgc_ContrasenaHash = pvc_ContrasenaHash;
    }

    @JsonIgnore
    public String getEstadoValidacion() {
        return this.vgc_EstadoValidacion;
    }

    public void setEstadoValidacion(String pvc_EstadoValidacion) {
        this.vgc_EstadoValidacion = pvc_EstadoValidacion;
    }

    @JsonIgnore
    public String getEstadoRol() {
        return this.vgc_EstadoRol;
    }

    public void setEstadoRol(String pvc_EstadoRol) {
        this.vgc_EstadoRol = pvc_EstadoRol;
    }
}
