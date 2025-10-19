import { Router } from 'express';
import { uploadArtifacts, generateMetadata, insertMetadata, getContractPublic } from '../controllers/contracts.controller';

export const contractsRouter = Router();

// POST /api/contracts/artifacts/upload -> upload ABI and bytecode to web3.storage
contractsRouter.post('/artifacts/upload', uploadArtifacts);

// POST /api/contracts/metadata/generate-one -> generate one metadata JSON and upload to web3.storage
contractsRouter.post('/metadata/generate-one', generateMetadata);

// POST /api/contracts/metadata/insert -> insert metadata pointers into DB
contractsRouter.post('/metadata/insert', insertMetadata);

// GET /api/contracts/:name -> client-facing metadata view
contractsRouter.get('/:name', getContractPublic);


