/**
 * The public interface of this module exposes the functions as specified by
 * https://github.com/ethereum/consensus-specs/blob/dev/specs/deneb/polynomial-commitments.md#kzg
 */
export type Bytes32 = Uint8Array; // 32 bytes
export type Bytes48 = Uint8Array; // 48 bytes
export type KZGProof = Uint8Array; // 48 bytes
export type KZGCommitment = Uint8Array; // 48 bytes
export type Blob = Uint8Array; // 4096 * 32 bytes
export type Cell = Uint8Array; // 64 * 32 bytes

export type ProofResult = [KZGProof, Bytes32];

export interface TrustedSetupJson {
  setup_G1: string[];
  setup_G2: string[];
  setup_G1_lagrange: string[];
  roots_of_unity: string[];
}

export const BYTES_PER_BLOB: number;
export const BYTES_PER_COMMITMENT: number;
export const BYTES_PER_FIELD_ELEMENT: number;
export const BYTES_PER_PROOF: number;
export const BYTES_PER_CELL: number;
export const FIELD_ELEMENTS_PER_BLOB: number;
export const FIELD_ELEMENTS_PER_CELL: number;
export const CELLS_PER_EXT_BLOB: number;

/**
 * Initialize the library with a trusted setup file.
 *
 * Can pass either a .txt or a .json file with setup configuration. Converts
 * JSON formatted trusted setup into the native format that the base library
 * requires. The created file will be in the same as the origin file but with a
 * ".txt" extension.
 *
 * Uses user provided location first. If one is not provided then defaults to
 * the official Ethereum mainnet setup from the KZG ceremony. Should only be
 * used for cases where the Ethereum official mainnet KZG setup is acceptable.
 *
 * @param {number} precompute
 * @param {string | undefined} filePath
 * @default - If no string is passed the default trusted setup from the Ethereum KZG ceremony is used
 *
 * @throws {TypeError} - Non-String input
 * @throws {Error} - For all other errors. See error message for more info
 */
export function loadTrustedSetup(precompute: number, filePath?: string): void;

/**
 * Convert a blob to a KZG commitment.
 *
 * @param {Blob} blob - The blob representing the polynomial to be committed to
 *
 * @return {KZGCommitment} - The resulting commitment
 *
 * @throws {TypeError} - For invalid arguments or failure of the native library
 */
export function blobToKzgCommitment(blob: Blob): KZGCommitment;

/**
 * Compute KZG proof for polynomial in Lagrange form at position z.
 *
 * @param {Blob}    blob - The blob (polynomial) to generate a proof for
 * @param {Bytes32} zBytes - The generator z-value for the evaluation points
 *
 * @return {ProofResult} - Tuple containing the resulting proof and evaluation
 *                         of the polynomial at the evaluation point z
 *
 * @throws {TypeError} - For invalid arguments or failure of the native library
 */
export function computeKzgProof(blob: Blob, zBytes: Bytes32): ProofResult;

/**
 * Given a blob, return the KZG proof that is used to verify it against the
 * commitment.
 *
 * @param {Blob}    blob - The blob (polynomial) to generate a proof for
 * @param {Bytes48} commitmentBytes - Commitment to verify
 *
 * @return {KZGProof} - The resulting proof
 *
 * @throws {TypeError} - For invalid arguments or failure of the native library
 */
export function computeBlobKzgProof(blob: Blob, commitmentBytes: Bytes48): KZGProof;

/**
 * Verify a KZG poof claiming that `p(z) == y`.
 *
 * @param {Bytes48} commitmentBytes - The serialized commitment corresponding to polynomial p(x)
 * @param {Bytes32} zBytes - The serialized evaluation point
 * @param {Bytes32} yBytes - The serialized claimed evaluation result
 * @param {Bytes48} proofBytes - The serialized KZG proof
 *
 * @return {boolean} - true/false depending on proof validity
 *
 * @throws {TypeError} - For invalid arguments or failure of the native library
 */
export function verifyKzgProof(
  commitmentBytes: Bytes48,
  zBytes: Bytes32,
  yBytes: Bytes32,
  proofBytes: Bytes48
): boolean;

/**
 * Given a blob and its proof, verify that it corresponds to the provided
 * commitment.
 *
 * @param {Blob}    blob - The serialized blob to verify
 * @param {Bytes48} commitmentBytes - The serialized commitment to verify
 * @param {Bytes48} proofBytes - The serialized KZG proof for verification
 *
 * @return {boolean} - true/false depending on proof validity
 *
 * @throws {TypeError} - For invalid arguments or failure of the native library
 */
export function verifyBlobKzgProof(blob: Blob, commitmentBytes: Bytes48, proofBytes: Bytes48): boolean;

/**
 * Given an array of blobs and their proofs, verify that they correspond to their
 * provided commitment.
 *
 * Note: blobs[0] relates to commitmentBytes[0] and proofBytes[0]
 *
 * @param {Blob}    blobs - An array of serialized blobs to verify
 * @param {Bytes48} commitmentsBytes - An array of serialized commitments to verify
 * @param {Bytes48} proofsBytes - An array of serialized KZG proofs for verification
 *
 * @return {boolean} - true/false depending on batch validity
 *
 * @throws {TypeError} - For invalid arguments or failure of the native library
 */
export function verifyBlobKzgProofBatch(blobs: Blob[], commitmentsBytes: Bytes48[], proofsBytes: Bytes48[]): boolean;

/**
 * Get the cells for a given blob.
 *
 * @param {Blob}    blob - the blob to get cells for
 *
 * @return {Cell[]} - An array of cells
 *
 * @throws {Error} - Failure to allocate or compute cells
 */
export function computeCells(blob: Blob): Cell[];

/**
 * Get the cells and proofs for a given blob.
 *
 * @param {Blob}    blob - the blob to get cells/proofs for
 *
 * @return {[Cell[], KZGProof[]]} - A tuple of cells and proofs
 *
 * @throws {Error} - Failure to allocate or compute cells and proofs
 */
export function computeCellsAndKzgProofs(blob: Blob): [Cell[], KZGProof[]];

/**
 * Given at least 50% of cells, reconstruct the missing cells/proofs.
 *
 * @param[in] {number[]}  cellIndices - The identifiers for the cells you have
 * @param[in] {Cell[]}    cells - The cells you have
 *
 * @return {[Cell[], KZGProof[]]} - A tuple of cells and proofs
 *
 * @throws {Error} - Invalid input, failure to allocate or error recovering
 * cells and proofs
 */
export function recoverCellsAndKzgProofs(cellIndices: number[], cells: Cell[]): [Cell[], KZGProof[]];

/**
 * Verify that multiple cells' proofs are valid.
 *
 * @param {Bytes48[]} commitmentsBytes - The commitments for each cell
 * @param {number[]}  cellIndices - The column index for each cell
 * @param {Cell[]}    cells - The cells to verify
 * @param {Bytes48[]} proofsBytes - The proof for each cell
 *
 * @return {boolean} - True if the cells are valid with respect to the given commitments
 *
 * @throws {Error} - Invalid input, failure to allocate memory, or errors verifying batch
 */
export function verifyCellKzgProofBatch(
  commitmentsBytes: Bytes48[],
  cellIndices: number[],
  cells: Cell[],
  proofsBytes: Bytes48[]
): boolean;
