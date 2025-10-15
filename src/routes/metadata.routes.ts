import { Router } from 'express';
import { generateAllMetadata, uploadMetadataAndArtifacts } from '../services/metadata.service';

export const metadataRouter = Router();

// POST /api/contracts/metadata/generate -> returns array of metadata objects
metadataRouter.post('/metadata/generate', async (_req, res) => {
  try {
    const result = await generateAllMetadata();
    res.status(200).json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to generate metadata' });
  }
});

// POST /api/contracts/metadata/upload -> generates from compiled and uploads public metadata + artifacts
metadataRouter.post('/metadata/upload', async (_req, res) => {
  try {
    const items = await generateAllMetadata();
    const results = await uploadMetadataAndArtifacts(items);
    res.status(200).json(results);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'failed to upload metadata' });
  }
});


