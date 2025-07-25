import process from 'process';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { configuration } from './config';

const {
  otel: { enabled, otelEndpoint, serviceName },
} = configuration();

if (enabled) {
  const traceExporter = new OTLPTraceExporter({
    url: `${otelEndpoint}/v1/traces`,
    compression: CompressionAlgorithm.GZIP,
  });

  const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
  });

  // initialize the SDK and register with the OpenTelemetry API
  // this enables the API to record telemetry
  sdk.start();
  console.log(`OpenTelemetry SDK started for service: ${serviceName}`);

  // gracefully shut down the SDK on process exit
  process.on('SIGTERM', () => {
    sdk
      .shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error) => console.log('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
} else {
  console.log('OpenTelemetry is disabled. Skipping initialization.');
}
