import { Web3Storage } from 'web3.storage';
import { ref } from 'vue';

const WEB3STORAGE_TOKEN = import.meta.env.VITE_WEB3STORAGE_TOKEN;

function makeStorageClient() {
  if (!WEB3STORAGE_TOKEN) throw new Error('Missing web3.storage token');
  return new Web3Storage({ token: WEB3STORAGE_TOKEN });
}

export function useIpfsUpload() {
  const uploading = ref(false);
  const error = ref<string | null>(null);

  async function uploadMetadataToIpfs(metadata: Record<string, any>): Promise<string | null> {
    uploading.value = true;
    error.value = null;
    try {
      const client = makeStorageClient();
      const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
      const file = new File([blob], 'metadata.json');
      const cid = await client.put([file], { wrapWithDirectory: false });
      return `https://${cid}.ipfs.w3s.link/metadata.json`;
    } catch (e: any) {
      error.value = e.message || 'IPFS upload failed';
      return null;
    } finally {
      uploading.value = false;
    }
  }

  async function uploadImageToIpfs(file: File): Promise<string | null> {
    uploading.value = true;
    error.value = null;
    try {
      const client = makeStorageClient();
      const cid = await client.put([file], { wrapWithDirectory: false });
      return `https://${cid}.ipfs.w3s.link/${file.name}`;
    } catch (e: any) {
      error.value = e.message || 'IPFS image upload failed';
      return null;
    } finally {
      uploading.value = false;
    }
  }

  return { uploading, error, uploadMetadataToIpfs, uploadImageToIpfs };
}
