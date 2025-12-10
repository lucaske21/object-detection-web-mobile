/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USE_CUSTOM_API?: string;
  readonly VITE_API_ENDPOINT?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
