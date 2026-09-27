// The SplitText plugin's ESM entry doesn't load under Node/SSR (it fails to
// import there), so it's isolated in its own `.client` module. React Router
// strips `.client` files from the server bundle and exports `undefined` in
// their place there — safe here because RevealText only touches SplitText
// inside a useGSAP effect, which never runs during server rendering.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

export { SplitText };
