/* head.js - runs before first paint (was the first inline <script> in <head>). */

  // Direct-link landing, part 1 (runs before first paint): remember the
  // fragment this page was opened with — e.g. #moplicity-merch from
  // fortworthpac.com/#moplicity-merch — and stop the browser restoring
  // an old scroll position over it. Part 2, at the end of <body>, reads
  // every channel the fragment can arrive through and does the landing.
  window.__fwOpenHash = window.location.hash || '';
  // On the live site this page runs inside the host's frame, and the
  // fragment the visitor opened with (e.g. fortworthpac.com/#merch)
  // can sit on the FRAMING page's address instead of this document's
  // own — the 302 from the custom domain keeps it on the outer URL.
  // Capture it from the parent/top address now, before first paint,
  // whenever this document's own address carries no fragment.
  if (!window.__fwOpenHash) {
    try {
      if (window.parent && window.parent !== window && window.parent.location.hash) window.__fwOpenHash = window.parent.location.hash;
    } catch (e) { /* cross-origin host — its address is not readable */ }
  }
  if (!window.__fwOpenHash) {
    try {
      if (window.top && window.top !== window && window.top.location.hash) window.__fwOpenHash = window.top.location.hash;
    } catch (e) { /* cross-origin host — its address is not readable */ }
  }
  // #merch is a route, not a section: flag it on <html> right away so
  // the CSS below swaps the homepage for the merch-only page as the
  // body parses — no hero flash while the end-of-body router runs.
  if (window.__fwOpenHash === '#merch') {
    try { document.documentElement.classList.add('fw-merch-route'); } catch (e) {}
  }
  // #modiamond is a route the same way: MoDiamond's own page.
  if (window.__fwOpenHash === '#modiamond') {
    try { document.documentElement.classList.add('fw-modiamond-route'); } catch (e) {}
  }
  // #modiamond-heels is a route the same way: the MoDiamond Heels page.
  if (window.__fwOpenHash === '#modiamond-heels') {
    try { document.documentElement.classList.add('fw-heels-route'); } catch (e) {}
  }
  // #md-purses is a route the same way: the MD Purse Collection page.
  if (window.__fwOpenHash === '#md-purses') {
    try { document.documentElement.classList.add('fw-purses-route'); } catch (e) {}
  }
  try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
