import { Request, Response } from 'express';
import { z } from 'zod';
import { uploadArtifactsDirect } from '../services/artifacts.service';
import { generateContractMetadata, insertContractMetadata, getPublicContractDetails } from '../services';

const uploadArtifactsSchema = z.object({
  abi: z.array(z.any()),
  bytecode: z.string().min(1),
});


const generateMetadataSchema = z.object({
  name: z.string(),
  category: z.string(),
  version: z.string().default('1.0.0'),
  source: z.string(),
  abiCid: z.string().startsWith('bafy').or(z.string().startsWith('Qm')).or(z.string().startsWith('ipfs://')),
  bytecodeCid: z.string().startsWith('bafy').or(z.string().startsWith('Qm')).or(z.string().startsWith('ipfs://')),
  parameters: z.array(z.object({ name: z.string(), type: z.string() })).default([]),
});

const insertMetadataSchema = z.object({
  name: z.string(),
  category: z.string(),
  version: z.string(),
  source: z.string(),
  metadataCid: z.string(),
  abiCid: z.string(),
  bytecodeCid: z.string(),
});

export async function uploadArtifacts(req: Request, res: Response) {
  const parse = uploadArtifactsSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid body', details: parse.error.flatten() });
  }
  try {
    const { abi, bytecode } = parse.data;
    const cids = await uploadArtifactsDirect(abi, bytecode);
    return res.status(200).json({ abiCid: cids.abiCid, bytecodeCid: cids.bytecodeCid });
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'failed to upload artifacts' });
  }
}

export async function generateMetadata(req: Request, res: Response) {
  const parse = generateMetadataSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid body', details: parse.error.flatten() });
  }
  try {
    const meta = await generateContractMetadata(parse.data);
    return res.status(200).json(meta);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'failed to generate metadata' });
  }
}

export async function insertMetadata(req: Request, res: Response) {
  const parse = insertMetadataSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'invalid body', details: parse.error.flatten() });
  }
  try {
    const result = await insertContractMetadata(parse.data);
    return res.status(201).json(result);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'failed to insert metadata' });
  }
}

export async function getContractPublic(req: Request, res: Response) {
  const { name } = req.params;
  try {
    const data = await getPublicContractDetails(name);
    if (!data) return res.status(404).json({ error: 'not found' });
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'failed to fetch details' });
  }
}


