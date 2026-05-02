/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend origin (e.g. http://localhost:3000). Leave empty in dev to use the Vite proxy (same-origin /api and /health). */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
