import { type Container, createIdentifier } from '@blocksuite/global/di';
import { Extension } from '@blocksuite/store';

export interface IFileSizeLimitService {
  maxFileSize: number;
  onOverFileSize?: () => void;
}

export const FileSizeLimitProvider = createIdentifier<IFileSizeLimitService>(
  'FileSizeLimitService'
);

/**
 * Returns whether any file in the batch exceeds the per-file size limit.
 *
 * On overflow, call onOverFileSize when it is set (for example to open the quota dialog).
 * Otherwise call onFallback (for example to show a toast).
 */
export function checkFileSizeExceeded(
  limit: IFileSizeLimitService,
  files: File[],
  onFallback?: (maxFileSize: number) => void
): boolean {
  const { maxFileSize, onOverFileSize } = limit;
  const exceeded = files.some(file => file.size > maxFileSize);
  if (!exceeded) return false;

  if (onOverFileSize) {
    onOverFileSize();
  } else {
    onFallback?.(maxFileSize);
  }
  return true;
}

export class FileSizeLimitService
  extends Extension
  implements IFileSizeLimitService
{
  // 2GB
  maxFileSize = 2 * 1024 * 1024 * 1024;

  static override setup(di: Container) {
    di.addImpl(FileSizeLimitProvider, FileSizeLimitService);
  }
}
