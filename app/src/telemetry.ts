import { NodeSDK } from "@opentelemetry/sdk-node";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";

process.env.OTEL_TRACES_EXPORTER ??= "none";
process.env.OTEL_LOGS_EXPORTER ??= "none";
process.env.OTEL_SERVICE_NAME ??= "app";

let sdk: NodeSDK | undefined;

export function startTelemetry(): void {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) return;

  sdk = new NodeSDK({
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 15_000,
      }),
    ],
  });
  sdk.start();
}

export async function stopTelemetry(): Promise<void> {
  await sdk?.shutdown();
}