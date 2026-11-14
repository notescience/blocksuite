import {
  type Container,
  type ResolveOptions,
  type ServiceIdentifierValue,
  ServiceProvider,
  type ServiceVariant,
} from '@blocksuite/global/di';

/**
 * Combines two providers: primary wins, fallback is used only when primary misses.
 *
 * Paste adapters used to be built from the store container only. Markdown / HTML
 * matchers are registered on the store, while view services such as
 * FileSizeLimitProvider are registered on the std container.
 * Using std.provider directly drops store getAll results, because DI getAll does
 * not fall back to the parent container. Primary (store) keeps its current
 * behavior, and fallback (std) is read only when primary has no match.
 */
export class FallbackServiceProvider extends ServiceProvider {
  readonly container: Container;

  constructor(
    private readonly _primary: ServiceProvider,
    private readonly _fallback: ServiceProvider
  ) {
    super();
    this.container = _primary.container;
  }

  getAllRaw(
    identifier: ServiceIdentifierValue,
    options?: ResolveOptions
  ): Map<ServiceVariant, any> {
    // Insert fallback first, then let primary overwrite the same variant so store services stay visible.
    return new Map([
      ...this._fallback.getAllRaw(identifier, options),
      ...this._primary.getAllRaw(identifier, options),
    ]);
  }

  getRaw(identifier: ServiceIdentifierValue, options?: ResolveOptions) {
    const found = this._primary.getRaw(identifier, {
      ...options,
      optional: true,
    });
    if (found !== undefined) return found;

    // Keep the caller's optional flag: get throws when missing, getOptional returns empty.
    return this._fallback.getRaw(identifier, options);
  }
}
