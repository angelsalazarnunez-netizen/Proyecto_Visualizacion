import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { RUTA_REGISTRO } from "../../servicios/Srv_SIM_Seguridad.js";
import "./Frm_SIM_Seguridad.css";
import "./Frm_SIM_RegistrarUsuario.css";

/**
 * Descripción: Registro de una cuenta de usuario con correo institucional (HU-001). La cuenta
 *   queda pendiente de validar el correo y de que la jefatura le asigne un rol.
 */

const ESTADO_INICIAL = {
    nombre: "",
    primerApellido: "",
    segundoApellido: "",
    numeroCedula: "",
    fechaNacimiento: "",
    correoInstitucional: "",
    contrasena: "",
};

function Frm_SIM_RegistrarUsuario() {
    const [formulario, setFormulario] = useState(ESTADO_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState("");
    const [exito, setExito] = useState(null);

    const requisitos = useMemo(() => {
        const clave = formulario.contrasena;

        return {
            longitud: clave.length >= 8,
            mayuscula: /[A-Z]/.test(clave),
            numero: /[0-9]/.test(clave),
            especial: /[^A-Za-z0-9]/.test(clave),
        };
    }, [formulario.contrasena]);

    function actualizarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((previo) => ({
            ...previo,
            [name]: value,
        }));

        setError("");
    }

    function cancelarRegistro() {
        setFormulario(ESTADO_INICIAL);
        setError("");
        setExito(null);
    }

    async function registrarUsuario(evento) {
        evento.preventDefault();

        setError("");
        setExito(null);

        const correoNormalizado =
            formulario.correoInstitucional
                .trim()
                .toLowerCase();

        if (!correoNormalizado.endsWith("@ucr.ac.cr")) {
            setError(
                "Solo se aceptan correos del dominio institucional de la UCR."
            );
            return;
        }

        if (
            !requisitos.longitud ||
            !requisitos.mayuscula ||
            !requisitos.numero ||
            !requisitos.especial
        ) {
            setError(
                "La contraseña no cumple las políticas de seguridad: mínimo 8 caracteres, una letra mayúscula, un número y un carácter especial."
            );
            return;
        }

        setEnviando(true);

        try {
            const respuesta = await fetch(
                RUTA_REGISTRO,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nombre: formulario.nombre.trim(),
                        primerApellido:
                            formulario.primerApellido.trim(),
                        segundoApellido:
                            formulario.segundoApellido.trim(),
                        numeroCedula:
                            formulario.numeroCedula.trim(),
                        fechaNacimiento:
                        formulario.fechaNacimiento,
                        correoInstitucional:
                        correoNormalizado,
                        contrasena:
                        formulario.contrasena,
                    }),
                }
            );

            const cuerpo = await respuesta.json();

            if (!respuesta.ok) {
                setError(
                    cuerpo.mensaje ||
                    "No fue posible completar el registro."
                );
                return;
            }

            setExito(cuerpo);
            setFormulario(ESTADO_INICIAL);
        } catch {
            setError(
                "No se pudo conectar con el servicio de registro."
            );
        } finally {
            setEnviando(false);
        }
    }

    return (
        <main className="sim-seguridad pantalla-registro">
            <section className="tarjeta-registro">

                <header className="encabezado-registro">
                    <div
                        className="logo-ucr"
                        aria-hidden="true"
                    >
                        UCR
                    </div>

                    <h1>
                        Crear cuenta - Sistema de importaciones
                    </h1>
                </header>

                {exito ? (
                    <div className="cuerpo-registro">

                        <div
                            className="alert alert-success"
                            role="status"
                        >
                            {exito.mensaje}
                        </div>

                        <div className="resumen-registro">
                            <p>
                                <strong>
                                    Correo institucional:
                                </strong>{" "}
                                {exito.correoInstitucional}
                            </p>

                            <p>
                                <strong>
                                    Estado de validación:
                                </strong>{" "}
                                {exito.estadoValidacion}
                            </p>

                            <p>
                                <strong>
                                    Estado de asignación de rol:
                                </strong>{" "}
                                {exito.estadoAsignacionRol}
                            </p>
                        </div>

                        {exito.enlaceVerificacion ? (
                            <p className="ayuda">
                                Enlace de prueba:{" "}
                                <a
                                    href={exito.enlaceVerificacion}
                                >
                                    validar correo institucional
                                </a>
                            </p>
                        ) : null}

                        <div className="acciones">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={cancelarRegistro}
                            >
                                Registrar otra cuenta
                            </button>
                        </div>

                        <p className="nota text-center">
                            <Link to="/login">Volver a iniciar sesión</Link>
                        </p>

                    </div>
                ) : (
                    <form
                        className="cuerpo-registro"
                        onSubmit={registrarUsuario}
                    >

                        <div className="row g-3">

                            <div className="col-md-4">
                                <label
                                    htmlFor="txtNombre"
                                    className="form-label"
                                >
                                    Nombre
                                </label>

                                <input
                                    id="txtNombre"
                                    type="text"
                                    className="form-control"
                                    name="nombre"
                                    value={formulario.nombre}
                                    onChange={actualizarCampo}
                                    placeholder="Katherine"
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label
                                    htmlFor="txtPrimerApellido"
                                    className="form-label"
                                >
                                    Primer apellido
                                </label>

                                <input
                                    id="txtPrimerApellido"
                                    type="text"
                                    className="form-control"
                                    name="primerApellido"
                                    value={
                                        formulario.primerApellido
                                    }
                                    onChange={actualizarCampo}
                                    placeholder="Valverde"
                                    required
                                />
                            </div>

                            <div className="col-md-4">
                                <label
                                    htmlFor="txtSegundoApellido"
                                    className="form-label"
                                >
                                    Segundo apellido
                                </label>

                                <input
                                    id="txtSegundoApellido"
                                    type="text"
                                    className="form-control"
                                    name="segundoApellido"
                                    value={
                                        formulario.segundoApellido
                                    }
                                    onChange={actualizarCampo}
                                    placeholder="Fallas"
                                />
                            </div>

                        </div>

                        <div className="row g-3 mt-1">

                            <div className="col-md-6">
                                <label
                                    htmlFor="txtNumeroCedula"
                                    className="form-label"
                                >
                                    Número de cédula
                                </label>

                                <input
                                    id="txtNumeroCedula"
                                    type="text"
                                    className="form-control"
                                    name="numeroCedula"
                                    value={
                                        formulario.numeroCedula
                                    }
                                    onChange={actualizarCampo}
                                    placeholder="1 0234 0567"
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label
                                    htmlFor="txtFechaNacimiento"
                                    className="form-label"
                                >
                                    Fecha de nacimiento
                                </label>

                                <input
                                    id="txtFechaNacimiento"
                                    type="date"
                                    className="form-control"
                                    name="fechaNacimiento"
                                    value={
                                        formulario.fechaNacimiento
                                    }
                                    onChange={actualizarCampo}
                                    required
                                />
                            </div>

                        </div>

                        <div className="mt-3">
                            <label
                                htmlFor="txtCorreoInstitucional"
                                className="form-label"
                            >
                                Correo institucional
                            </label>

                            <input
                                id="txtCorreoInstitucional"
                                type="email"
                                className="form-control"
                                name="correoInstitucional"
                                value={
                                    formulario.correoInstitucional
                                }
                                onChange={actualizarCampo}
                                placeholder="katherine.valverde@ucr.ac.cr"
                                required
                            />

                            <p className="ayuda mt-2">
                                Solo se aceptan correos del dominio institucional de la UCR.
                            </p>
                        </div>

                        <div className="mt-3">
                            <label
                                htmlFor="txtContrasena"
                                className="form-label"
                            >
                                Contraseña
                            </label>

                            <input
                                id="txtContrasena"
                                type="password"
                                className="form-control"
                                name="contrasena"
                                value={
                                    formulario.contrasena
                                }
                                onChange={actualizarCampo}
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <ul className="requisitos">
                            <li
                                className={
                                    requisitos.longitud
                                        ? "ok"
                                        : "pendiente"
                                }
                            >
                <span>
                  {requisitos.longitud
                      ? "✓"
                      : "×"}
                </span>{" "}
                                Mínimo 8 caracteres
                            </li>

                            <li
                                className={
                                    requisitos.mayuscula
                                        ? "ok"
                                        : "pendiente"
                                }
                            >
                <span>
                  {requisitos.mayuscula
                      ? "✓"
                      : "×"}
                </span>{" "}
                                Una letra mayúscula
                            </li>

                            <li
                                className={
                                    requisitos.numero
                                        ? "ok"
                                        : "pendiente"
                                }
                            >
                <span>
                  {requisitos.numero
                      ? "✓"
                      : "×"}
                </span>{" "}
                                Un número
                            </li>

                            <li
                                className={
                                    requisitos.especial
                                        ? "ok"
                                        : "pendiente"
                                }
                            >
                <span>
                  {requisitos.especial
                      ? "✓"
                      : "×"}
                </span>{" "}
                                Un carácter especial
                            </li>
                        </ul>

                        <p className="nota">
                            Al registrarte se enviará un correo de
                            validación. La cuenta quedará pendiente
                            de validación y de asignación de rol por
                            parte de la jefatura.
                        </p>

                        {error ? (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {error}
                            </div>
                        ) : null}

                        <div className="acciones">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={cancelarRegistro}
                                disabled={enviando}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={enviando}
                            >
                                {enviando
                                    ? "Registrando..."
                                    : "Registrarme"}
                            </button>
                        </div>

                        <p className="nota text-center">
                            ¿Ya tiene una cuenta?{" "}
                            <Link to="/login">Iniciar sesión</Link>
                        </p>

                    </form>
                )}

            </section>
        </main>
    );
}

export default Frm_SIM_RegistrarUsuario;