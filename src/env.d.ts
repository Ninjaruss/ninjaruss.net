export {};

declare global {
  interface Window {
    /** Installed by MediaLightbox when its page component is initialized. */
    openMediaLightbox?: (src: string, alt: string, type?: 'image' | 'video') => void;
  }
}
