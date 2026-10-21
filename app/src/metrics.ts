import { metrics, Histogram } from "@opentelemetry/api";
import { NextFunction, Request, Response } from "express";

let duration: Histogram | undefined;

function getDuration(): Histogram {
  duration ??= metrics.getMeter("app").createHistogram("http.server.request.duration", {
    unit: "s",
    description: "Duración de las requests HTTP",
    advice: {
      explicitBucketBoundaries: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
    },
  });
  return duration;
}

export function httpMetrics(req: Request, res: Response, next: NextFunction): void {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const seconds = Number(process.hrtime.bigint() - start) / 1e9;
    getDuration().record(seconds, {
      "http.request.method": req.method,
      "http.route": req.route ? `${req.baseUrl}${req.route.path}` : "unmatched",
      "http.response.status_code": res.statusCode,
    });
  });

  next();
}