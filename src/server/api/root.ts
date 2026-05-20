import { postRouter } from "@/server/api/routers/post";
import { clientsRouter } from "@/server/api/routers/clients";
import { invoicesRouter } from "@/server/api/routers/invoices";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { dashboardRouter } from "@/server/api/routers/dashboard";
import { settingsRouter } from "@/server/api/routers/settings";
import { reportsRouter } from "@/server/api/routers/reports";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  clients: clientsRouter,
  invoices: invoicesRouter,
  dashboard: dashboardRouter,
  settings: settingsRouter,
  reports: reportsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
