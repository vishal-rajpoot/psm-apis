import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import methodOverride from 'method-override';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import {
  methodNotFound,
  addLogIdInRequest,
} from './middlewares/requestExtension';
import apis from './apis';
import errorHandler from './middlewares/errorHandler';

const app = express();

Sentry.init({
  dsn: 'https://43eb0d48ec773b4fefb1229dcbe63e83@o4506987591172096.ingest.us.sentry.io/4506987600347136',
  integrations: [
    // enable HTTP calls tracing
    new Sentry.Integrations.Http({ tracing: true }),
    // enable Express.js middleware tracing
    new Sentry.Integrations.Express({ app }),
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: 1.0,
});

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

app.use(bodyParser.json({ limit: '50mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(methodOverride());
app.use(
  cors({
    origin: '*',
  })
);
app.use(express.json());

app.use(addLogIdInRequest);
app.use(apis);

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

app.use(errorHandler);
// app.use(methodNotFound);

export default app;
