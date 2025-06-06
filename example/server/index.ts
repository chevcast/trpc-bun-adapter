import { initTRPC } from "@trpc/server";
import { sleep } from "bun";
import { createBunServeHandler } from "trpc-bun-adapter";

const t = initTRPC.create();

export const router = t.router({
    ping: t.procedure.query(() => {
        return "pong";
    }),

    subscribe: t.procedure.subscription(async function* () {
        await sleep(1000);
        yield Math.random();
    }),
});

export type AppRouter = typeof router;

console.log("Building client...");
Bun.spawnSync(["bun", "bundle"]);

Bun.serve(
    createBunServeHandler(
        {
            endpoint: "/trpc",
            router,
        },
        {
            fetch(req) {
                const url = new URL(req.url);

                if (url.pathname === "/app.js") {
                    return new Response(Bun.file("./dist/app.js"));
                }

                if (url.pathname === "/") {
                    return new Response(Bun.file("./index.html"));
                }

                return new Response("Not found", { status: 404 });
            },
        },
    ),
);

console.log("Listening on http://localhost:3000");
