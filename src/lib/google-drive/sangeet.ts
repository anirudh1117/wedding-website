import "server-only";

import { Readable } from "node:stream";
import { buildAudioFileName } from "@/lib/sangeet/helpers";
import {
  ACCEPTED_AUDIO_MIME_TYPES,
  MAX_AUDIO_FILE_BYTES,
} from "@/lib/sangeet/constants";
import type { AcceptedAudioMimeType } from "@/lib/sangeet/constants";
import { GoogleDriveIntegrationError } from "./errors";
import { getOrCreateChildFolder, verifyRootFolderAccess } from "./folders";
import type { DriveClientLike, DriveFolderReference, DriveUploadResult } from "./types";

const SANGEET_FOLDER_NAME = "Sangeet Performances";
const GROOM_SUBFOLDER = "Groom";
const BRIDE_SUBFOLDER = "Bride";

/** Detect audio file format from magic bytes */
function detectAudioSignature(bytes: Buffer): AcceptedAudioMimeType | null {
  // ID3 tag (MP3 with ID3): 49 44 33
  if (bytes.length >= 3 && bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    return "audio/mpeg";
  }
  // MP3 sync frame: FF FB, FF FA, FF F3, FF F2
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0) {
    return "audio/mpeg";
  }
  // RIFF/WAV: 52 49 46 46 ... 57 41 56 45
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45
  ) {
    return "audio/wav";
  }
  // MP4/M4A: ftyp box at offset 4 — look for "M4A ", "mp4a", "isom"
  if (bytes.length >= 8 &&
    bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70
  ) {
    const brand = bytes.slice(8, 12).toString("ascii");
    if (["M4A ", "mp4a", "isom", "iso2", "avc1", "mmp4"].includes(brand.trim()) || brand.startsWith("M4")) {
      return "audio/mp4";
    }
    return "audio/mp4"; // any ftyp is treated as mp4/m4a
  }
  return null;
}

function assertAudioContent(bytes: Buffer, declaredMimeType: string): void {
  if (bytes.length === 0 || bytes.length > MAX_AUDIO_FILE_BYTES) {
    throw new GoogleDriveIntegrationError("VALIDATION", "Audio file size is invalid.", false);
  }

  const normalizedDeclared = declaredMimeType.toLowerCase();
  if (!ACCEPTED_AUDIO_MIME_TYPES.includes(normalizedDeclared as AcceptedAudioMimeType)) {
    throw new GoogleDriveIntegrationError("VALIDATION", "Unsupported audio MIME type.", false);
  }

  const detected = detectAudioSignature(bytes);
  // For M4A the declared types vary; accept any audio/mp4 family for detected mp4
  const isM4aFamily = (t: string | null) =>
    t === "audio/mp4" && ["audio/mp4", "audio/m4a", "audio/x-m4a"].includes(normalizedDeclared);
  const isMatch = detected === normalizedDeclared || isM4aFamily(detected);
  if (!isMatch) {
    throw new GoogleDriveIntegrationError(
      "VALIDATION",
      "Audio file content does not match its declared type.",
      false,
    );
  }
}

/** Ensure Sangeet / Groom or Sangeet / Bride folder hierarchy exists */
export async function ensureSangeetPartyFolder(args: {
  drive: DriveClientLike;
  sangeetRootFolderId: string;
  party: "groom" | "bride";
}): Promise<DriveFolderReference> {
  await verifyRootFolderAccess({ drive: args.drive, rootFolderId: args.sangeetRootFolderId });

  const sangeetFolder = await getOrCreateChildFolder({
    drive: args.drive,
    parentFolderId: args.sangeetRootFolderId,
    folderName: SANGEET_FOLDER_NAME,
  });

  const partySubfolder = args.party === "groom" ? GROOM_SUBFOLDER : BRIDE_SUBFOLDER;

  return getOrCreateChildFolder({
    drive: args.drive,
    parentFolderId: sangeetFolder.id,
    folderName: partySubfolder,
  });
}

/** Create a per-performance subfolder inside the party folder */
export async function ensureSangeetPerformanceFolder(args: {
  drive: DriveClientLike;
  partyFolderId: string;
  performanceId: string;
}): Promise<DriveFolderReference> {
  return getOrCreateChildFolder({
    drive: args.drive,
    parentFolderId: args.partyFolderId,
    folderName: args.performanceId,
  });
}

/** Upload audio bytes to the performance folder and return the file reference */
export async function uploadSangeetAudio(args: {
  drive: DriveClientLike;
  performanceFolderId: string;
  performanceId: string;
  originalFileName: string;
  mimeType: string;
  plainBytes: Buffer;
}): Promise<DriveUploadResult> {
  assertAudioContent(args.plainBytes, args.mimeType);

  const fileName = buildAudioFileName(args.performanceId, args.originalFileName);
  const normalizedMime = args.mimeType.toLowerCase();

  const stream = Readable.from(args.plainBytes);

  const response = await args.drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: normalizedMime,
      parents: [args.performanceFolderId],
    },
    media: {
      mimeType: normalizedMime,
      body: stream,
    },
    fields: "id,name,size",
    supportsAllDrives: true,
  });

  if (!response.data.id || !response.data.name) {
    throw new GoogleDriveIntegrationError(
      "UNKNOWN",
      "Google Drive did not return file metadata after upload.",
      true,
    );
  }

  return {
    fileId: response.data.id,
    fileName: response.data.name,
    byteSize: args.plainBytes.length,
  };
}

export function buildSangeetFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${encodeURIComponent(folderId)}`;
}

export function buildSangeetFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${encodeURIComponent(fileId)}/view`;
}
