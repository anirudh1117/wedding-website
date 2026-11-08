import "server-only";

import type {
  RegistrationOperationRecord,
  RegistrationOperationStore,
} from "@/lib/google-drive/types";

/**
 * In-memory store for local development and tests only.
 * Not safe for serverless/multi-instance production deployments.
 */
const operationMap = new Map<string, RegistrationOperationRecord>();

export class InMemoryRegistrationOperationStore implements RegistrationOperationStore {
  async findByRegistrationId(
    registrationId: string,
  ): Promise<RegistrationOperationRecord | null> {
    return operationMap.get(registrationId) ?? null;
  }

  async save(record: RegistrationOperationRecord): Promise<void> {
    operationMap.set(record.registrationId, {
      ...record,
      uploadedDocumentIds: { ...record.uploadedDocumentIds },
    });
  }
}

export function resetInMemoryRegistrationOperationStore(): void {
  operationMap.clear();
}
