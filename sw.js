/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "72393a9f856493cff43df2c97eacedec"
  }, {
    "url": "pwa-512x512.png",
    "revision": "431ba326088232273c64fe2fad06c05c"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9e22f0e48e62500451192838095eb38d"
  }, {
    "url": "index.html",
    "revision": "a3e91c7c3b7ed2f14575e097ff342ab0"
  }, {
    "url": "icon.svg",
    "revision": "384615379b16f1c85e843d847feb7dda"
  }, {
    "url": "favicon.ico",
    "revision": "97f2e1a1760c0b8bc998c756354b0d8d"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0fbab8a358a46ef2b98f2e928775739c"
  }, {
    "url": "404.html",
    "revision": "c1a4c5cab0fd5832e14e5d3b72f61ac2"
  }, {
    "url": "assets/index-DG-oltdZ.css",
    "revision": null
  }, {
    "url": "assets/index-CNmxmPT0.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "0fbab8a358a46ef2b98f2e928775739c"
  }, {
    "url": "favicon.ico",
    "revision": "97f2e1a1760c0b8bc998c756354b0d8d"
  }, {
    "url": "icon.svg",
    "revision": "384615379b16f1c85e843d847feb7dda"
  }, {
    "url": "pwa-192x192.png",
    "revision": "9e22f0e48e62500451192838095eb38d"
  }, {
    "url": "pwa-512x512.png",
    "revision": "431ba326088232273c64fe2fad06c05c"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "72393a9f856493cff43df2c97eacedec"
  }, {
    "url": "manifest.webmanifest",
    "revision": "fb0319dcf04f970820243e768ad468c2"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/images\.unsplash\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "remote-book-covers-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 2592000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
