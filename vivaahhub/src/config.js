/** Local defaults — no .env file required */
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
export const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";
export const PUBLIC_API_URL = `${API_BASE_URL}/api/public`;
