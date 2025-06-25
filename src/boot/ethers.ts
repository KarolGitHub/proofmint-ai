export {};

declare global {
  interface Window {
    ethereum?: { [key: string]: unknown };
  }
}
