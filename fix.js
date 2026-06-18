/*
 * TGV Lyria onboard portal fix (unofficial, client-side).
 *
 * The portal crashes to a blank "Application error" screen when the train is
 * delayed: its journey-progress component builds a backwards time interval
 * (current stop's delayed departure ends up later than the next stop's
 * not-yet-updated arrival), the date library throws `RangeError: Invalid
 * interval`, and with no error boundary that one exception unmounts the whole
 * app.
 *
 * This script ships NONE of the portal's code. It hooks the page's module
 * loader and, for any module that contains that specific faulty throw, rewrites
 * just the `throw` into a harmless `return false` at runtime. Everything else
 * runs exactly as the portal's authors wrote it.
 */
(function () {
  "use strict";

  function patchFactory(orig) {
    try {
      var src = String(orig);
      if (src.indexOf("Invalid interval") === -1) return orig;
      var patched = src.replace(
        /throw\s+(?:new\s+)?RangeError\(\s*["']Invalid interval["']\s*\)/g,
        "return !1"
      );
      if (patched === src) return orig;
      var rebuilt = (0, eval)("(" + patched + ")");
      window.__lyriaPortalFix = (window.__lyriaPortalFix || 0) + 1;
      return rebuilt;
    } catch (e) {
      return orig;
    }
  }

  function scan(mods) {
    if (!mods) return;
    for (var id in mods) {
      try {
        if (typeof mods[id] === "function" && String(mods[id]).indexOf("Invalid interval") !== -1) {
          mods[id] = patchFactory(mods[id]);
        }
      } catch (e) {}
    }
  }

  function wrapPush(p) {
    return function (chunk) {
      try { if (chunk && chunk[1]) scan(chunk[1]); } catch (e) {}
      return p.apply(this, arguments);
    };
  }

  function hook(arr) {
    if (!arr || arr.__lyriaHooked) return arr;
    try {
      var cur = wrapPush(arr.push);
      Object.defineProperty(arr, "push", {
        configurable: true,
        get: function () { return cur; },
        set: function (p) { cur = wrapPush(p); }
      });
      arr.__lyriaHooked = true;
    } catch (e) {}
    return arr;
  }

  var KEY = "webpackChunk_N_E";
  if (window[KEY]) {
    hook(window[KEY]);
  } else {
    var val;
    try {
      Object.defineProperty(window, KEY, {
        configurable: true,
        get: function () { return val; },
        set: function (v) { val = hook(v); }
      });
    } catch (e) {}
  }
})();
