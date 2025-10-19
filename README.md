<<<<<<< HEAD
Web3-wiz server side 
=======
## Saturn API additions

### Endpoints

- POST `/api/contracts/artifacts/upload`
  - body: `{ abi: any[], bytecode: string }`
  - resp: `{ abiCid: string, bytecodeCid: string }`

- POST `/api/contracts/metadata/generate-one`
  - body: `{ name: string, category: string, version: string, source: string, abiCid: string|ipfs://, bytecodeCid: string|ipfs://, parameters?: {name:string,type:string}[] }`
  - resp: `{ name, category, version, source, abi: ipfsURI, compiled: ipfsURI, bytecode: '', parameters, metadataCid }`

- POST `/api/contracts/metadata/insert`
  - body: `{ name, category, version, source, metadataCid, abiCid, bytecodeCid }`
  - resp: row inserted `{ id, name, category, version, source, metadataCid, abiCid, bytecodeCid }`

- GET `/api/contracts/:name`
  - resp: `{ name, category, version, source, metadata: ipfsURI, abi: ipfsURI, compiled: ipfsURI }`

### Environment

- `WEB3_STORAGE_TOKEN` (required)
- `DATABASE_URL` (required)
- `CONTRACTS_DIR` (optional; defaults to project contracts dir)

### Notes

- Upload uses `web3.storage` and returns raw CIDs; client-facing GET surfaces `ipfs://` URIs.


>>>>>>> 5b255fe (worrkflow)
