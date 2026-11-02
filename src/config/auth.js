// config/auth.js
  const API_URL = "http://127.0.0.1:8000/api";  // ajusta al puerto real de tu `php artisan serve`
/* const API_URL = "https://nonprofit-senate-grows-claims.trycloudflare.com/api"; */
/* const API_URL = import.meta.env.VITE_API_URL; */

export async function login(email, password) {
  try {
   const response = await fetch(`${API_URL}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"   // <-- agrega esta línea
  },
  body: JSON.stringify({ email, password })
});

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("usuario", JSON.stringify(data.data.usuario));
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: "No se pudo conectar con el servidor"
    };
  }
}

// Helper para llamadas a rutas protegidas (auth:sanctum): agrega el header Authorization
export async function authFetch(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",   // <-- agrega esta línea
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  return response.json();
}

export async function logout() {
  try {
    // Avisa al backend para invalidar el token (currentAccessToken()->delete())
    await authFetch("/logout", { method: "POST" });
  } catch (error) {
    // Si el backend no responde, igual limpiamos la sesión local
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
  }
}

export function getUsuario() {
  const usuario = localStorage.getItem("usuario");
  return usuario ? JSON.parse(usuario) : null;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return !!getToken();
}