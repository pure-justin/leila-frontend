declare global {
  interface Window {
    google: typeof google;
    gm_authFailure: () => void;
  }
}

export {};