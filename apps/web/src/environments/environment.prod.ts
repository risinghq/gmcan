interface Environment {
  production: boolean;
  apiUrl: string;
  appUrl: string;
}

// The worker supplies the URLs from the site's own origin on every request.
// The server entry and rendered app have separate module copies, so the object lives on globalThis.
const shared = globalThis as typeof globalThis & { gmcanEnvironment?: Environment };

export const environment: Environment = (shared.gmcanEnvironment ??= {
  production: true,
  apiUrl: "",
  appUrl: "",
});
