import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import {usePuterStore} from "~/lib/puter";
import {useEffect} from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { init } = usePuterStore();

  useEffect(() => {
    init()
  }, [init]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Must run before the SDK loads: puter.js checks this flag on construction. */}
        <script
          dangerouslySetInnerHTML={{ __html: "window.PUTER_QUIET = true;" }}
        />
        <script src="https://js.puter.com/v2/"></script>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="ground-center min-h-screen flex flex-col">
      <div className="screen-bar">
        <span className="wordmark">SIGNAL</span>
        <span className="mono-meta text-flag">ERROR</span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6 px-6 md:px-10 py-16 max-w-3xl">
        <h1 className="display text-5xl md:text-6xl">{message}</h1>
        <p className="text-lg leading-relaxed text-muted">{details}</p>
        {stack && (
          <pre className="panel w-full p-4 overflow-x-auto font-mono text-xs text-dim">
            <code>{stack}</code>
          </pre>
        )}
        <a href="/" className="btn-outline w-fit">
          BACK TO ALL SCANS
        </a>
      </div>
    </main>
  );
}
