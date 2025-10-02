<div align="center">

![Logo](https://raw.githubusercontent.com/discordhttps/discord.https/refs/heads/main/assets/logo.png)

[![Discord](https://img.shields.io/badge/discord-blue?logo=discord&logoColor=white)](https://discord.gg/pSgfJ4K5ej)
[![npm version](https://img.shields.io/npm/v/discord.https.svg)](https://www.npmjs.com/package/discord.https)
[![License](https://img.shields.io/npm/l/discord.https.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/discord.https.svg)](https://www.npmjs.com/package/discord.https)
[![Docs](https://img.shields.io/badge/docs-latest-blue)](https://discordhttps.github.io/discord.https/)
</div>

**Discord.https** is a robust, modular library for implementing Discord HTTP interactions.

It handles various interactions, adds a layer of wrapper over raw interactions with rich utility methods, and organizes them into modular routes, making your bot's code cleaner, easier to understand, and easier to maintain. It works seamlessly in both serverless and persistent server environments.

📄 **Documentation:** [https://discordhttps.github.io/discord.https/](https://discordhttps.github.io/discord.https/)

Need help? Join us on discord  [https://discord.gg/pSgfJ4K5ej](https://discord.gg/pSgfJ4K5ej)

```js
import Client, { InteractionResponseType } from "discord.https";
import NodeAdapter from "@discordhttps/nodejs-adapter";

const client = new Client({
  token: "YOUR BOT TOKEN",
  publicKey: "YOUR PUBLIC KEY",
  httpAdapter: new NodeAdapter(),
});

client.command(
  (builder) => builder.setName("hi").setDescription("reply hello!"),
  async (interaction) => await interaction.reply("hello!")
);

await client.listen("interactions", 3000, () => {
  console.log(
    "Listening for interactions on port 3000 at the /interactions endpoint"
  );
});
```

## Project Updates

> **Note**: Looking for volunteer contributors! If you are interested, join us on Discord: [https://discord.gg/pSgfJ4K5ej](https://discord.gg/pSgfJ4K5ej)

> **Note**: Utility methods such as <interaction>.editReply() and <interaction>.deferReply() are currently in development, so you won’t need to manually handle the raw response object in the future.

> **Note**: Utility methods were initially planned to closely follow Discord.js. However, since HTTP interactions are mostly used in a serverless environment, instead of having many layers of objects like Discord.js, an Eris-like approach will be adopted to keep the utilities minimal and lightweight.

> **Breaking Update (latest note)**: The goal was to stay within the web-standard V8 engine, but `@discord/rest` heavily depends on the Node.js environment. There are two choices: either use `@discord/rest` or build a custom REST handler. For now, `@discord/rest` will be used. The focus is on the Edge network, primarily Cloudflare. However, Cloudflare recently added [native Node.js support](https://blog.cloudflare.com/nodejs-workers-2025/). Previously, Node.js support was polyfilled, which can be inefficient for servers due to extra overhead. Now, Node.js support is native. Hence, from now on, the focus will be on Node.js APIs instead of web-standard/browser-context APIs.

## Examples

>Examples are outdated. You are no longer required to handle the raw response. The core is still there, and you can use these examples as a reference.

Deprecate warning, this example can be serve as a basic idea, but it has been changed quite a lot since, with utility functions.

**You can view example/reference implementations here:**

- Nodejs Runtime: [https://github.com/discordhttps/nodejs-example](https://github.com/discordhttps/nodejs-example)
- V8 isolates runtime(Cloudflare Workers): [https://github.com/discordhttps/cloudflare-example](https://github.com/discordhttps/cloudflare-example)

## Installation

### Node.js

```
npm install discord.https @discordhttps/nodejs-adapter
```

### Cloudflare

```
npm install discord.https @discordhttps/cloudflare-adapter
```

## Documentation

- **Discord.https Docs:** [https://discordhttps.github.io/discord.https/](https://discordhttps.github.io/discord.https/)
- **Discord Interaction Docs:** [Responding to an Interaction](https://discord.com/developers/docs/interactions/receiving-and-responding#responding-to-an-interaction)

## Todo for v4

- [ ] Build a simplified `npx create-app` command
- [ ] Implement tests
- [ ] Build channel, guild, etc wrapper
- [X] ~~Build interaction wrapper~~
- [x] ~~HTTP adapters to support most hosting environments~~. Currently implemented: Node.js adapter for [Node.js runtime](https://github.com/discord-http/nodejs-adapter) and [Cloudflare adapter for V8 isolates runtime](https://github.com/discord-http/cloudflare-adapter)
- [x] Examples(currently outdated, requires update)