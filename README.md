# Pulse

Simple electron app that controls online status across services. Built for personal use and as an experiment using a lot of code-generation with `GPT 4`.

## Usage

Run `npm run start` to start the dev server.

If you wish to control an external service besides the supported ones (slack, custom api), take a look at `common/types.ts` for the spec and `connectors/slack.ts` for an example implementation.

