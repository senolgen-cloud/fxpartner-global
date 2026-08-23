// Which optional sign-in providers this deployment actually has.
//
// Read on the server and passed down as a prop, so a button is only rendered
// when the credentials behind it exist. Checking process.env in the component
// would not work: these are server-only variables and a client component
// cannot see them.
export function configuredProviders(): { google: boolean } {
  return {
    google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  };
}
