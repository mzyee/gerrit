/**
 * @license
 * Copyright (C) 2020 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const PROBE_PATH = '/Documentation/index.html';
const DOCS_BASE_PATH = '/Documentation';

// NOTE: Below we define 2 types (DocUrlBehaviorConfig and RestApi) to avoid
// type 'any'. These are temporary definitions and they must be
// updated/moved/removed when we start converting our codebase to typescript.
// Right now we are using these types here just for adding typescript support to
// our build/test infrastructure. Doing so we avoid massive code updates at this
// stage.

// TODO: introduce global gerrit config type instead of DocUrlBehaviorConfig.
// The DocUrlBehaviorConfig is a temporary type
interface DocUrlBehaviorConfig {
  gerrit?: {doc_url?: string};
}

// TODO: implement RestApi type correctly and remove interface from this file
interface RestApi {
  probePath(url: string): Promise<boolean>;
}

export function getBaseUrl(): string {
  return window.CANONICAL_PATH || '';
}

let getDocsBaseUrlCachedPromise: Promise<string | null> | undefined;

/**
 * Get the docs base URL from either the server config or by probing.
 *
 * @param {Object} config The server config.
 * @param {!Object} restApi A REST API instance
 * @return {!Promise<string>} A promise that resolves with the docs base
 *     URL.
 */
export function getDocsBaseUrl(
  config: DocUrlBehaviorConfig,
  restApi: RestApi
): Promise<string | null> {
  if (!getDocsBaseUrlCachedPromise) {
    getDocsBaseUrlCachedPromise = new Promise(resolve => {
      if (config && config.gerrit && config.gerrit.doc_url) {
        resolve(config.gerrit.doc_url);
      } else {
        restApi.probePath(getBaseUrl() + PROBE_PATH).then(ok => {
          resolve(ok ? getBaseUrl() + DOCS_BASE_PATH : null);
        });
      }
    });
  }
  return getDocsBaseUrlCachedPromise;
}

export function _testOnly_clearDocsBaseUrlCache() {
  getDocsBaseUrlCachedPromise = undefined;
}

/**
 * Pretty-encodes a URL. Double-encodes the string, and then replaces
 *   benevolent characters for legibility.
 */
export function encodeURL(url: string, replaceSlashes?: boolean): string {
  // @see Issue 4255 regarding double-encoding.
  let output = encodeURIComponent(encodeURIComponent(url));
  // @see Issue 4577 regarding more readable URLs.
  output = output.replace(/%253A/g, ':');
  output = output.replace(/%2520/g, '+');
  if (replaceSlashes) {
    output = output.replace(/%252F/g, '/');
  }
  return output;
}

/**
 * Single decode for URL components. Will decode plus signs ('+') to spaces.
 * Note: because this function decodes once, it is not the inverse of
 * encodeURL.
 */
export function singleDecodeURL(url: string): string {
  const withoutPlus = url.replace(/\+/g, '%20');
  return decodeURIComponent(withoutPlus);
}
