import { ponder, type Event, type Context } from "@/generated";

ponder.on("NounsFlow:VoteCast", async ({ event, context }) => {
  // todo
  // call frontend to invalidate budget cache
});
