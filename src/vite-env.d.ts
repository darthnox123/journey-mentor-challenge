/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DUFFEL_API_URL: string
  readonly VITE_DUFFEL_API_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
