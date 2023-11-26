import { initTRPC } from "@trpc/server";
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
import z from "zod";

import { Connections, Connectors } from "../common/types";

export const createRouter = (connectors: Connectors, emitter: EventEmitter) => {
  const t = initTRPC.create({ isServer: true });
  return t.router({
    initial: t.procedure.query(() => {
      const list = Object.fromEntries(
        Object.entries(connectors).map((entry) => {
          return [entry[0], false];
        })
      );
      return list;
    }),
    updateStatus: t.procedure
      .input(
        z.object({
          active: z.boolean(),
        })
      )
      .mutation(async (opts) => {
        const { input } = opts;
        const promises = Object.values(connectors).map((c) =>
          c.setStatus(input.active)
        );
        await Promise.all(promises);
      }),
    subscribeStatus: t.procedure.subscription((opts) => {
      return observable((emit) => {
        function onUpdate(json: { name: string; status: boolean }) {
          emit.next(json);
        }
        emitter.on("onStatusChange", onUpdate);
        return () => {
          emitter.off("onStatusChange", onUpdate);
        };
      });
    }),
  });
};

export type AppRouter = ReturnType<typeof createRouter>;
