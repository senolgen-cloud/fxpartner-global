// Is the page running as an installed app rather than in a browser tab?
//
// Two checks because iOS answers only one of them: Safari has never
// supported the display-mode media query on the standalone navigator flag's
// behalf, and navigator.standalone is a non-standard property Apple alone
// implements. Android and desktop answer the media query.
//
// Extracted when a third copy was about to be written — AddToHomeScreen and
// InstallAppButtons each carried their own.
//
// Callers must only run this in an effect. At module scope or during the
// first render it throws on the server, and on the client it would produce
// markup that disagrees with what the server sent.
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;

  // ?pwa=1 forces the installed-app branch, in development only. Standalone
  // mode is otherwise untestable in a browser: patching matchMedia from the
  // console works until the next navigation reloads the page and takes the
  // patch with it, so the chrome that only exists in the installed app
  // could never actually be checked. Gated on NODE_ENV, so a production
  // build cannot be talked into it by a query string.
  if (process.env.NODE_ENV !== "production") {
    if (new URLSearchParams(window.location.search).get("pwa") === "1") return true;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
