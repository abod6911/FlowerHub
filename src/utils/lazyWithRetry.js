import { lazy } from 'react';

/**
 * Enhanced lazy loader with automatic retry and cache bust on deployment chunk mismatch.
 * Solves ChunkLoadError / 'Failed to fetch dynamically imported module' caused by GitHub Pages deployments.
 */
export function lazyWithRetry(componentImport) {
  return lazy(async () => {
    const pageHasBeenForceRefreshed = window.sessionStorage.getItem('page_has_been_force_refreshed');

    try {
      return await componentImport();
    } catch (error) {
      console.warn('Dynamic chunk load failed, attempting retry...', error);

      // First retry after brief pause (handles transient network blips)
      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        return await componentImport();
      } catch (retryError) {
        console.error('Dynamic chunk retry failed:', retryError);

        // If the chunk still fails and we haven't force-refreshed yet, reload page to fetch latest deployed manifest
        if (!pageHasBeenForceRefreshed) {
          window.sessionStorage.setItem('page_has_been_force_refreshed', 'true');
          window.location.reload();
          return new Promise(() => {}); // Never resolves, page is reloading
        }

        // Reset flag so subsequent attempts work
        window.sessionStorage.removeItem('page_has_been_force_refreshed');
        throw retryError;
      }
    }
  });
}
