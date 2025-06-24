import { ref } from 'vue';
import { ethers } from 'ethers';
import NotaryABI from 'src/contracts/Notary.json';
import { NOTARY_CONTRACT_ADDRESS } from 'src/contracts/address.js';

const account = ref<string | null>(null);
const provider = ref<ethers.providers.Web3Provider | null>(null);
const signer = ref<ethers.Signer | null>(null);
const notaryContract = ref<ethers.Contract | null>(null);

export function useWallet() {
  // Connect to MetaMask
  async function connectWallet() {
    if (window.ethereum) {
      provider.value = new ethers.providers.Web3Provider(window.ethereum);
      await provider.value.send('eth_requestAccounts', []);
      signer.value = provider.value.getSigner();
      account.value = await signer.value.getAddress();
      notaryContract.value = new ethers.Contract(NOTARY_CONTRACT_ADDRESS, NotaryABI, signer.value);
    } else {
      throw new Error('MetaMask is not installed');
    }
  }

  return {
    account,
    provider,
    signer,
    notaryContract,
    connectWallet,
  };
}
