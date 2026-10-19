package cr.ac.ucr.sim.utilerias.modelo.seguridad;

/**
 * Descripcion: modelo de respuesta que representa
 * un permiso asociado a un rol.
 */
public class ModeloPermisoRespuesta {

    private Long vgn_IdPermiso;
    private String vgc_Codigo;
    private String vgc_Nombre;
    private String vgc_Descripcion;

    public ModeloPermisoRespuesta() {
    }

    public Long getIdPermiso() {
        return vgn_IdPermiso;
    }

    public void setIdPermiso(Long vln_IdPermiso) {
        this.vgn_IdPermiso = vln_IdPermiso;
    }

    public String getCodigo() {
        return vgc_Codigo;
    }

    public void setCodigo(String vlc_Codigo) {
        this.vgc_Codigo = vlc_Codigo;
    }

    public String getNombre() {
        return vgc_Nombre;
    }

    public void setNombre(String vlc_Nombre) {
        this.vgc_Nombre = vlc_Nombre;
    }

    public String getDescripcion() {
        return vgc_Descripcion;
    }

    public void setDescripcion(String vlc_Descripcion) {
        this.vgc_Descripcion = vlc_Descripcion;
    }
}