import fs from 'fs';
import path from 'path';
import { Web3Storage, filesFromPath } from 'web3.storage';
import { env } from '../config/env';
import { pool } from '../models/db';

export type GenerateMetadataInput = {
  name: string;
  category: string;
  version: string;
  source: string;
  abiCid: string; // can be ipfs:// or raw CID
  bytecodeCid: string; // can be ipfs:// or raw CID
  parameters: Array<{ name: string; type: string }>;
};

export async function generateContractMetadata(input: GenerateMetadataInput) {
  const toUri = (cid: string) => (cid.startsWith('ipfs://') ? cid : `ipfs://${cid}`);
  const content = {
    name: input.name,
    category: input.category,
    version: input.version,
    source: input.source,
    abi: toUri(input.abiCid),
    compiled: toUri(input.bytecodeCid),
    bytecode: '',
    parameters: input.parameters || [],
  };

  if (!env.web3StorageToken) throw new Error('WEB3_STORAGE_TOKEN not configured');
  const client = new Web3Storage({ token: env.web3StorageToken });

  const tmp = path.join(process.cwd(), `.tmp_metadata_${Date.now()}.json`);
  fs.writeFileSync(tmp, JSON.stringify(content, null, 2));
  try {
    const files = await filesFromPath(tmp);
    const cid = await client.put(files, { wrapWithDirectory: false });
    return { ...content, metadataCid: cid };
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
}

export async function insertContractMetadata(input: {
  name: string;
  category: string;
  version: string;
  source: string;
  metadataCid: string;
  abiCid: string;
  bytecodeCid: string;
}) {
  const text = `
    INSERT INTO contract_metadata (name, category, version, source, metadata_cid, abi_cid, bytecode_cid)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (name)
    DO UPDATE SET category = EXCLUDED.category, version = EXCLUDED.version, source = EXCLUDED.source,
                  metadata_cid = EXCLUDED.metadata_cid, abi_cid = EXCLUDED.abi_cid, bytecode_cid = EXCLUDED.bytecode_cid
    RETURNING id, name, category, version, source, metadata_cid as "metadataCid", abi_cid as "abiCid", bytecode_cid as "bytecodeCid";
  `;
  const values = [
    input.name,
    input.category,
    input.version,
    input.source,
    input.metadataCid,
    input.abiCid,
    input.bytecodeCid,
  ];
  const result = await pool.query(text, values);
  return result.rows[0];
}

export async function getPublicContractDetails(name: string) {
  const text = `
    SELECT name, category, version, source,
           'ipfs://' || metadata_cid as metadata,
           'ipfs://' || abi_cid as abi,
           'ipfs://' || bytecode_cid as compiled
    FROM contract_metadata
    WHERE name = $1
  `;
  const result = await pool.query(text, [name]);
  return result.rows[0] || null;
}


