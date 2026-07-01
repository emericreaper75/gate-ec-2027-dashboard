/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface Window {
  electronAPI?: {
    storeGet: (key: string) => Promise<string | null>;
    storeSet: (key: string, value: string) => Promise<void>;
    storeDelete: (key: string) => Promise<void>;
    platform: string;
    isElectron: boolean;
  };
}
