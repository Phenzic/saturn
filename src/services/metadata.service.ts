import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { Web3Storage, filesFromPath } from 'web3.storage';

type PublicMetadata = {
  name: string;
  category: string;
  version: string;
  source: string; // placeholder, fill with repo path
  compiled: string; // path to artifact file
  abi: any[];
  bytecode: string;
  parameters: Array<{ name: string; type: string }>;
};

function readJSON(p: string): any {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function detectConstructorInputs(artifact: any): Array<{ name: string; type: string }> {
  const ctor = (artifact.abi || []).find((i: any) => i.type === 'constructor');
  if (!ctor) return [];
  return (ctor.inputs || []).map((i: any) => ({ name: i.name || '', type: i.type || 'bytes' }));
}

export async function generateAllMetadata(): Promise<PublicMetadata[]> {
  const prebuilts = path.join(env.contractsDir, 'contracts', 'contracts', 'prebuilts');
  const artifactsRoot = path.join(env.contractsDir, 'artifacts_forge', 'contracts', 'prebuilts');
  const items: PublicMetadata[] = [];

  if (!fs.existsSync(prebuilts)) {
    throw new Error(`prebuilts not found at ${prebuilts}`);
  }

  const categories = fs.readdirSync(prebuilts).filter((d) => fs.statSync(path.join(prebuilts, d)).isDirectory());
  for (const category of categories) {
    const dir = path.join(prebuilts, category);
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.sol')) continue;
      const contractName = path.parse(file).name;
      const artifactPath = path.join(artifactsRoot, category, `${contractName}.sol`, `${contractName}.json`);
      if (!fs.existsSync(artifactPath)) {
        // skip if not compiled yet
        continue;
      }
      const artifact = readJSON(artifactPath);
      const parameters = detectConstructorInputs(artifact);
      items.push({
        name: contractName,
        category,
        version: '1.0.0',
        source: `contracts/contracts/prebuilts/${category}/${file}`,
        compiled: artifactPath,
        abi: artifact.abi || [],
        bytecode: artifact.bytecode?.object || artifact.evm?.bytecode?.object || '',
        parameters,
      });
    }
  }

  return items;
}

export async function uploadMetadataAndArtifacts(items: PublicMetadata[]) {
  if (!env.web3StorageToken) throw new Error('WEB3_STORAGE_TOKEN not configured');
  const client = new Web3Storage({ token: env.web3StorageToken });

  const results: Array<{ name: string; category: string; metadataCid: string; abiCid: string; compiledCid: string }> = [];
  for (const item of items) {
    const abiTmp = path.join(process.cwd(), '.tmp_abi.json');
    fs.writeFileSync(abiTmp, JSON.stringify(item.abi, null, 2));

    const abiFiles = await filesFromPath(abiTmp);
    const compiledFiles = await filesFromPath(item.compiled);

    const [abiCid, compiledCid] = await Promise.all([
      client.put(abiFiles, { wrapWithDirectory: false }),
      client.put(compiledFiles, { wrapWithDirectory: false }),
    ]);

    const publicMeta = {
      name: item.name,
      category: item.category,
      version: item.version,
      source: item.source,
      compiled: `ipfs://${compiledCid}`,
      abi: `ipfs://${abiCid}`,
      bytecode: item.bytecode && item.bytecode.length > 0 ? item.bytecode : '',
      parameters: item.parameters,
    };
    const metaTmp = path.join(process.cwd(), '.tmp_metadata.json');
    fs.writeFileSync(metaTmp, JSON.stringify(publicMeta, null, 2));
    const metaFiles = await filesFromPath(metaTmp);
    const metadataCid = await client.put(metaFiles, { wrapWithDirectory: false });

    results.push({ name: item.name, category: item.category, metadataCid, abiCid, compiledCid });

    fs.unlinkSync(abiTmp);
    fs.unlinkSync(metaTmp);
  }
  return results;
}


