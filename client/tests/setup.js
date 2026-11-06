import cssEscape from "css.escape";

// JSDOM does not provide CSS.escape, which user-event uses for native radio groups.
if (!globalThis.CSS?.escape) {
  Object.defineProperty(globalThis, "CSS", {
    configurable: true,
    value: { ...globalThis.CSS, escape: cssEscape }
  });
}
