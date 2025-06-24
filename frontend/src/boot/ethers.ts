import { boot } from 'quasar/wrappers';
import { ethers } from 'ethers';
import NotaryABI from 'src/contracts/Notary.json';
import { NOTARY_CONTRACT_ADDRESS } from 'src/contracts/address.js';

// Add type declaration for window.ethereum
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    ethereum?: any;
  }
}

let provider: ethers.providers.Web3Provider | null = null;
let signer: ethers.Signer | null = null;
let notaryContract: ethers.Contract | null = null;

export default boot(async ({ app }) => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    notaryContract = new ethers.Contract(NOTARY_CONTRACT_ADDRESS, NotaryABI, provider);
  }

  app.config.globalProperties.$ethers = ethers;
  app.config.globalProperties.$provider = provider;
  app.config.globalProperties.$signer = signer;
  app.config.globalProperties.$notaryContract = notaryContract;
});

export { provider, signer, notaryContract };
