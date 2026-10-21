import app from "./app";
import { startTelemetry, stopTelemetry } from "./telemetry";

startTelemetry();

const PORT = Number(process.env.PORT) || 3000;
const server = app.listen(PORT, () => {
  console.log(`API escuchando en el puerto ${PORT}`);
});

process.on("SIGTERM", async () => {
  server.close();
  await stopTelemetry();
  process.exit(0);
});