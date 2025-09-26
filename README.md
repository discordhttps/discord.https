# Discord.https

[![npm version](https://img.shields.io/npm/v/discord.https.svg)](https://www.npmjs.com/package/discord.https)
[![License](https://img.shields.io/npm/l/discord.https.svg)](LICENSE)
[![Downloads](https://img.shields.io/npm/dm/discord.https.svg)](https://www.npmjs.com/package/discord.https/index.default.html)

**Discord.https** is a robust, modular library for implementing Discord HTTP interactions.

It handles various interactions and organizes them into modular routes, making your bot's code cleaner, easier to understand, and easier to maintain. It works seamlessly in both serverless and persistent server environments.

The core is production-ready and can be used in your new http interaction bots.

📄 **Documentation:** [https://discordhttps.github.io/discord.https/](https://discordhttps.github.io/discord.https/)

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
  async (interaction, client, _, res) => {
    res.writeHead(200, {
      "Content-Type": "application/json",
    });
    const username = interaction.user
      ? interaction.user.global_name
      : interaction.member.user.global_name;
    res.end(
      JSON.stringify({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `Hello! ${username}`,
        },
      })
    );
  }
);

await client.listen("interactions", 3000, () => {
  console.log(
    "Listening for interactions on port 3000 at the /interactions endpoint"
  );
});
```

**You can view example/reference implementations here:**

- Nodejs Runtime: [https://github.com/discordhttps/nodejs-example](https://github.com/discordhttps/nodejs-example)
- V8 isolates runtime(Cloudflare Workers): [https://github.com/discordhttps/cloudflare-example](https://github.com/discordhttps/cloudflare-example)

> **Note**: Looking for volunteer contributors! If you are interested, join us on Discord: [https://discord.gg/pSgfJ4K5ej](https://discord.gg/pSgfJ4K5ej)

> **Note**: Utility methods such as <interaction>.editReply() and <interaction>.deferReply() are currently in development, so you won’t need to manually handle the raw response object in the future.

> **Note**: Utility methods were initially planned to closely follow Discord.js. However, since HTTP interactions are mostly used in a serverless environment, instead of having many layers of objects like Discord.js, an Eris-like approach will be adopted to keep the utilities minimal and lightweight.

### To do:

- [ ] Build structures
- [ ] Build a simplified `npx create-app` command
- [ ] Implement tests
- [x] HTTP adapters to support all hosting environments. Currently implemented: Node.js adapter for [Node.js runtime](https://github.com/discord-http/nodejs-adapter) and [Cloudflare adapter for V8 isolates runtime](https://github.com/discord-http/cloudflare-adapter)
- [x] Examples
