const CLAVE_SESION = "sim.sesion";
const RUTA_LOGIN = "/api/autenticacion/login";

async function leerRespuesta(respuesta) {
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(cuerpo.mensaje || `El servidor respondió con el código ${respuesta.status}.`);
  }
  return cuerpo;
}

export async function iniciarSesion(credenciales) {
  const respuesta = await fetch(RUTA_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credenciales),
  });
  return leerRespuesta(respuesta);
}

export function guardarSesion(sesion) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

export function obtenerSesion() {
  const contenido = sessionStorage.getItem(CLAVE_SESION);
  if (!contenido) {
    return null;
  }
  try {
    const sesion = JSON.parse(contenido);
    return sesion && typeof sesion.token === "string" && sesion.token
      ? sesion
      : null;
  } catch (error) {
    sessionStorage.removeItem(CLAVE_SESION);
    return null;
  }
}

export function obtenerToken() {
  return obtenerSesion()?.token ?? null;
}

export function limpiarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

export async function cerrarSesion() {
  const token = obtenerToken();
  if (!token) {
    limpiarSesion();
    return;
  }

  const respuesta = await fetch("/api/autenticacion/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (respuesta.status === 401) {
    limpiarSesion();
    return;
  }
  if (!respuesta.ok) {
    throw new Error("No fue posible cerrar la sesión en el servidor.");
  }
  limpiarSesion();
}
