/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full API prefix (e.g. http://localhost:4000/api). Leave unset in dev to use the Vite proxy (/api). */
  readonly VITE_API_URL?: string;
  /** @deprecated Use VITE_API_URL */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
