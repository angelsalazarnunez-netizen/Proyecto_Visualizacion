package cr.ac.ucr.sim.accesodatos.autenticacion;

import cr.ac.ucr.sim.entidadnegocio.autenticacion.EntUsuario;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

/**
 * Autor: Katherine Susana Valverde Fallas
 * Fecha: 10/09/2026
 * Descripción: Acceso a datos de SIMF_USUARIO. La HU-002 es la dueña de esta clase; aquí se
 *   declara solo la consulta que necesita el expediente de la HU-031. No implementa reglas
 *   de negocio.
 */
@Repository
public class DalUsuario {

    @PersistenceContext
    private EntityManager vgo_EntityManager;

    /**
     * Autor: Katherine Susana Valverde Fallas
     * Fecha: 10/09/2026
     * Descripción: Obtiene un usuario por su identificador.
     *
     * @param pvn_IdUsuario identificador del usuario
     * @return usuario encontrado o null
     */
    public EntUsuario SIMF_USUARIO_ObtenerRegistro(Integer pvn_IdUsuario) {
        return pvn_IdUsuario == null
                ? null
                : this.vgo_EntityManager.find(EntUsuario.class, pvn_IdUsuario);
    }

    public EntUsuario SIMF_USUARIO_ObtenerPorCorreoInstitucional(String pvc_CorreoInstitucional) {
        if (pvc_CorreoInstitucional == null || pvc_CorreoInstitucional.isBlank()) {
            return null;
        }

        TypedQuery<EntUsuario> vlo_Consulta = this.vgo_EntityManager.createQuery(
                "SELECT u FROM EntUsuario u "
                        + "WHERE LOWER(u.vgc_CorreoInstitucional) = LOWER(:pvc_CorreoInstitucional)",
                EntUsuario.class);
        vlo_Consulta.setParameter("pvc_CorreoInstitucional", pvc_CorreoInstitucional.trim());
        try {
            return vlo_Consulta.getSingleResult();
        } catch (NoResultException vlo_Excepcion) {
            return null;
        }
    }
}
