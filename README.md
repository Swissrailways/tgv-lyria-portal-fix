# TGV Lyria Onboard Portal Fix (unofficial)

A tiny Chrome/Edge extension that stops the TGV Lyria onboard Wi-Fi portal
(`wifi.tgv-lyria.com`) from crashing to a blank **"Application error: a
client-side exception has occurred"** screen — which happens whenever the train
is **delayed**.

It is **client-side only**: it changes nothing on TGV Lyria's servers, sends no
data anywhere, and runs solely on `wifi.tgv-lyria.com`.

## The bug

During a delay, the portal's journey-progress bar builds a *backwards* time
interval — the current stop's real (delayed) departure ends up later than the
next stop's not-yet-recomputed arrival. The date library throws
`RangeError: Invalid interval`, and because there's no error boundary, that one
exception unmounts the **entire** app → blank screen.

## What this does

It ships **none of the portal's code**. At page load it hooks the page's module
loader and, for the module that contains that one faulty `throw`, rewrites it
into a harmless `return false` at runtime. Everything else runs exactly as the
portal's authors wrote it. (Verified: it renders normally, delays included.)

## Install (Chrome or Edge)

1. **Download** this repo — green **Code** button → **Download ZIP** — and unzip
   it (or `git clone`).
2. Open **`chrome://extensions`** (or `edge://extensions`).
3. Turn on **Developer mode** (toggle, top-right).
4. Click **Load unpacked** and pick the unzipped folder.
5. Open `wifi.tgv-lyria.com` on the train — it just works.

> Developer mode is required to load any extension that isn't from the Chrome
> Web Store; that's normal and expected. A true one-click Web Store listing is
> possible but needs a paid developer account plus a review, so it isn't set up
> here.

## Disclaimer

Unofficial and **not affiliated** with TGV Lyria, SNCF, SBB, or Moment/Flymingo
(the onboard-platform vendor). Provided as-is, no warranty — use at your own
risk. It only runs on `wifi.tgv-lyria.com` and only neutralizes the crash
described above.

## License

MIT — see [LICENSE](LICENSE).
