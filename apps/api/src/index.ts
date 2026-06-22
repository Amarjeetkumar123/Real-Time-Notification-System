import { createApiServer } from "./server.js";

const { httpServer, port } = await createApiServer();

httpServer.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});