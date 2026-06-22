import { Queue } from "bullmq";

import { apiConfig } from "./config.js";

export const eventQueue = new Queue("notification-events", {
  connection: {
    url: apiConfig.redisUrl,
  },
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    removeOnFail: 50,
  },
});