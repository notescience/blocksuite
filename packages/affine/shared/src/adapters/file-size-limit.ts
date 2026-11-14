import type { ServiceProvider } from '@blocksuite/global/di';

import {
  checkFileSizeExceeded,
  FileSizeLimitProvider,
} from '../services/file-size-limit-service.js';

/**
 * Checks the per-file size limit before paste creates blocks.
 * If any file in the batch is over the limit, run the quota callback and tell the adapter to skip the whole batch.
 * When the service is missing, do not block, so unit tests do not throw.
 */
export function exceedsFileSizeLimit(
  provider: ServiceProvider,
  files: File[]
): boolean {
  const limit = provider.getOptional(FileSizeLimitProvider);
  if (!limit) return false;

  return checkFileSizeExceeded(limit, files);
}
