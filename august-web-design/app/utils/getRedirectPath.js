/**
 * Resolves internal paths. Now that the filesystem matches the URL structure
 * (app/[lang]/library/symptoms/ serves /en/library/symptoms), this function
 * just preserves webview source params on the client — no path rewriting needed.
 */

function hasWebviewSource(search) {
  if (!search) return false;
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  return params.get('source') === 'webview';
}

function extractPathParts(input) {
  if (typeof input !== 'string') {
    return { pathname: input, search: '', hash: '' };
  }

  let pathname = input;
  let search = '';
  let hash = '';

  try {
    const parsed = new URL(input, 'http://localhost');
    pathname = parsed.pathname;
    search = parsed.search;
    hash = parsed.hash;
  } catch (error) {
    const hashIndex = pathname.indexOf('#');
    if (hashIndex !== -1) {
      hash = pathname.slice(hashIndex);
      pathname = pathname.slice(0, hashIndex);
    }

    const queryIndex = pathname.indexOf('?');
    if (queryIndex !== -1) {
      search = pathname.slice(queryIndex);
      pathname = pathname.slice(0, queryIndex);
    }
  }

  return { pathname, search, hash };
}

export function getRedirectPath(path) {
  if (typeof path !== 'string') {
    return path;
  }

  // Return external URLs unchanged
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//') ||
    /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)
  ) {
    return path;
  }

  const { pathname, search, hash } = extractPathParts(path);

  // On the client, propagate ?source=webview if present in the current URL
  let searchToAppend = '';

  if (hasWebviewSource(search)) {
    searchToAppend = search;
  } else if (typeof window !== 'undefined' && window.location?.search) {
    if (hasWebviewSource(window.location.search)) {
      searchToAppend = window.location.search;
    }
  }

  if (searchToAppend) {
    return `${pathname}${searchToAppend}${hash}`;
  }

  return path;
}
