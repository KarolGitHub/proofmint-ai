import { boot } from 'quasar/wrappers';
import { ethers } from 'ethers';
import NotaryABI from '@/contracts/Notary.json';

// Add type declaration for window.ethereum
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    ethereum?: unknown;
  }
}

let provider: ethers.providers.Web3Provider | null = null;
const signer: ethers.Signer | null = null;
let notaryContract: ethers.Contract | null = null;

export default boot(({ app }) => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    notaryContract = new ethers.Contract(
      import.meta.env.VITE_NOTARY_CONTRACT_ADDRESS,
      NotaryABI,
      provider,
    );
  }

  app.config.globalProperties.$ethers = ethers;
  app.config.globalProperties.$provider = provider;
  app.config.globalProperties.$signer = signer;
  app.config.globalProperties.$notaryContract = notaryContract;
});

export { provider, signer, notaryContract };
