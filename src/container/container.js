import { createInfra } from "./createInfra.js";
import { createRepositories } from "./createRepositories.js";
import { createHandlers } from "./createHandlers.js";
import { createEvents } from "./createEvents.js";
import { createHttp } from "./createHttp.js";

import { createLogger } from "../shared/logger/createLogger.js";
import { clock } from "../shared/clock/clock.js";

/**
 * createContainer
 *
 * Pure composition root. priorty of dependencies wise
 */
export function createContainer(config) {
  const logger = createLogger(config.logger);

  const infra = createInfra({ config, logger });

  const { unitOfWork, repositories } = createRepositories({
    infra,
    logger,
  });

  const commands = createHandlers({
    repositories,
    unitOfWork,
    logger,
    clock,
  });

  const events = createEvents({
    infra,
    repositories,
    unitOfWork,
    logger,
    clock,
  });

  const http = createHttp({
    commands,
    repositories,
    logger,
  });

  return {
    logger,
    infra,
    unitOfWork,
    repositories,
    commands,
    events,
    http,
  };
}
