import * as Sentry from "@sentry/node";

Sentry.init(
    {
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_ENV,
        tracesSampleRate: 1.0,
    }
);
