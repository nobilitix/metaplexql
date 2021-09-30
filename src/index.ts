import Koa from "koa";
import Router from "koa-router";
import graphqlHTTP from "koa-graphql";
import { logger, loggerMiddleware } from "./logger";
import { getSchema } from "./schema";
import { rootValue } from "./resolvers";

const PORT = process.env.PORT ?? 3000;
const app = new Koa();
const router = new Router();
app.use(loggerMiddleware);

router.all(
  "/graphql",
  graphqlHTTP({
    schema: await getSchema(),
    rootValue,
    graphiql: true,
  })
);
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT);
logger.info(`👂  metaplexql listening on port ${PORT}`);
