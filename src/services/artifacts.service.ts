import fs from 'fs';
import path from 'path';
import { Web3Storage, filesFromPath } from 'web3.storage';
import { env } from '../config/env';

export type UploadedArtifactsCids = {
  abiCid: string;
  bytecodeCid: string;
};

export async function uploadArtifactsDirect(abi: any[], bytecodeHex: string): Promise<UploadedArtifactsCids> {
  if (!env.web3StorageToken) throw new Error('WEB3_STORAGE_TOKEN not configured');
  const client = new Web3Storage({ token: env.web3StorageToken });

  const tmpDir = fs.mkdtempSync(path.join(process.cwd(), 'tmp_artifacts_'));

  const abiPath = path.join(tmpDir, 'abi.json');
  fs.writeFileSync(abiPath, JSON.stringify(abi, null, 2));

  const bytecodePath = path.join(tmpDir, 'bytecode.txt');
  fs.writeFileSync(bytecodePath, bytecodeHex.startsWith('0x') ? bytecodeHex : `0x${bytecodeHex}`);

  try {
    const [abiFiles, bytecodeFiles] = await Promise.all([
      filesFromPath(abiPath),
      filesFromPath(bytecodePath),
    ]);

    const [abiCid, bytecodeCid] = await Promise.all([
      client.put(abiFiles, { wrapWithDirectory: false }),
      client.put(bytecodeFiles, { wrapWithDirectory: false }),
    ]);

    return { abiCid, bytecodeCid };
  } finally {
    try { fs.unlinkSync(abiPath); } catch {}
    try { fs.unlinkSync(bytecodePath); } catch {}
    try { fs.rmdirSync(tmpDir); } catch {}
  }
}


