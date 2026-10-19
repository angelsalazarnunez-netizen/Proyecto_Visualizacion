package cr.ac.ucr.sim.logicanegocio.seguridad;

import cr.ac.ucr.sim.accesodatos.seguridad.DalPermiso;
import cr.ac.ucr.sim.entidadnegocio.seguridad.EntPermiso;
import cr.ac.ucr.sim.utilerias.ConstantesSeguridad;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Descripcion: Lógica de negocio
 * para la consulta de permisos del sistema.
 *
 * Historial de cambios:
 *   Responsable: Equipo de Desarrollo SIM
 *   Fecha: 12/10/2026
 *   Descripción: integración con main: usa ConstantesSeguridad.
 */
@Service
public class BllPermiso {

    private final DalPermiso vgo_DalPermiso;

    public BllPermiso(
            DalPermiso vlo_DalPermiso
    ) {
        this.vgo_DalPermiso = vlo_DalPermiso;
    }

    /**
     * Descripcion: obtiene los permisos activos
     * disponibles para asociar a roles.
     * @return lista de permisos activos.
     */
    @Transactional(readOnly = true)
    public List<EntPermiso> ListarPermisosActivos() {

        return vgo_DalPermiso.findAll()
                .stream()
                .filter(vlo_EnPermiso ->
                        ConstantesSeguridad.ESTADO_ACTIVO.equals(
                                vlo_EnPermiso.getEstado()
                        )
                )
                .toList();
    }
}