import chalk from "chalk";
import { REST } from "@discordjs/rest";
import { SlashCommandBuilder } from "@discordjs/builders";

import HttpInteractionServer from "./interactionServer.js";
import InteractionRouterManger from "./interactionRouter/internal.js";
import AutoCompleteKeyBuilder from "./interactionRouter/autoCompleteKeyBuilder.js";


import type { HttpAdapter, HttpAdapterSererResponse } from "./adapter/index.js";

import {
  InteractionType,
  InteractionResponseType,
  Routes,
  type APIApplication,
  type APIInteraction,
} from "discord-api-types/v10";

import {
  InteractionRouter,
  InteractionRouterCollector,
} from "./interactionRouter/index.js";

import type {
  AutoCompleteMiddleware,
  ButtonMiddleware,
  ContextMenuMiddleware,
  GeneralMiddleware,
  UnknownMiddleware,
  ModalMiddleware,
  SelectMenuMiddleware,
  CommandMiddleware,
  CommandbuilderType,
} from "./interactionRouter/internal.js";

export interface ClientOptions {
  token: string;
  publicKey: string;
  httpAdapter: HttpAdapter;
  debug?: boolean;
}

class Client extends HttpInteractionServer {
  private router = new InteractionRouterManger();
  client = new REST({
    version: "10",
  });

  constructor({ httpAdapter, publicKey, token, debug = false }: ClientOptions) {
    super(publicKey, httpAdapter, debug);
    this.client.setToken(token);
  }

  register(...routes: Array<InteractionRouter | InteractionRouterCollector>) {
    this.router.register(...routes);
  }

  middleware(...fns: GeneralMiddleware[]) {
    this.router.middlewares.push(...fns);
  }

  unknown(...fns: UnknownMiddleware[]) {
    this.router._unknownInteraction.push(...fns);
  }

  tryAsync(fns: Function[]) {
    fns.forEach((fn) => {
      if (fn.constructor.name !== "AsyncFunction")
        throw new Error(
          `[InteractionRouter - discord.http] Function: ${fn.name} is not async. ` +
            `Consider adding "async" to ${fn.name}. ` +
            `For more information: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function#description`
        );
    });
  }

  /**
   * Registers a command with its associated middleware.
   *
   * @example
   * ```ts
   * router.command(
   *   (builder) => builder.setName("Ping!").setDescription("Returns Pong!"),
   *   (interaction) => interaction.reply({ content: "pong!" })
   * );
   * ```
   */
  command(commandbuilder: CommandbuilderType, ...fns: CommandMiddleware[]) {
    this.tryAsync(fns);

    const build = commandbuilder(new SlashCommandBuilder());
    this.router._register("command", build.name, fns);

    const commandDefinition = build.toJSON();
    this.router.CommandDefinitions.push(commandDefinition);

    return new AutoCompleteKeyBuilder(commandDefinition);
  }

  /**
   * Registers a button interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.button("custom_button_id", buttonMiddleware);
   * ```
   */
  button(customId: string, ...fns: ButtonMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("button", customId, fns);
  }

  /**
   * Registers a modal interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.modal("custom_modal_id", modalMiddleware);
   * ```
   */
  modal(customId: string, ...fns: ModalMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("modal", customId, fns);
  }

  /**
   * Registers a role select interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.roleSelect("roleSelectName", roleSelectMiddleware);
   * ```
   */
  roleSelect(name: string, ...fns: SelectMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("roleSelect", name, fns);
  }

  /**
   * Registers a user select interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.userSelect("userSelectName", userSelectMiddleware);
   * ```
   */
  userSelect(name: string, ...fns: SelectMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("userSelect", name, fns);
  }
  /**
   * Registers a string select interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.stringSelect("stringSelectName", stringSelectMiddleware);
   * ```
   */
  stringSelect(name: string, ...fns: SelectMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("stringSelect", name, fns);
  }

  /**
   * Registers a channel select interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.channelSelect("channelSelectName", channelSelectMiddleware);
   * ```
   */
  channelSelect(name: string, ...fns: SelectMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("channelSelect", name, fns);
  }

  /**
   * Registers a mentionable select interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.mentionableSelect("mentionableSelectName", mentionableSelectMiddleware);
   * ```
   */
  mentionableSelect(name: string, ...fns: SelectMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("mentionableSelect", name, fns);
  }

  /**
   * Registers an autocomplete interaction with its associated middleware.
   *
   * @example
   * ```ts
   * const githubQuery = router.command(
   *   (builder) =>
   *     builder
   *       .setName("weather")  // The command name
   *       .setDescription("QuQuery weather information!")  // The command description
   *       .addStringOption(option =>
   *         option
   *           .setName("city")  // Option name
   *           .setDescription("City to get the weather for")  // Option description
   *           .setAutocomplete(true) // Enable autocomplete for this option
   *       ),
   *   (interaction) => handler
   * );
   * router.autocomplete(githubQuery.getAutoCompleteKey("city"), autocompleteMiddleware);
   * ```
   */

  autocomplete(key: AutoCompleteKeyBuilder, ...fns: AutoCompleteMiddleware[]) {
    this.tryAsync(fns);
    if (!(key instanceof AutoCompleteKeyBuilder))
      throw new Error(
        `[InteractionRouter - discord.https] Invalid autocomplete Key for function: ${fns
          .map((fn) => fn.name)
          .join(", ")}`
      );
    this.router._register(
      "autocomplete",
      AutoCompleteKeyBuilder._resolve(key),
      fns
    );
  }
  /**
   * Registers a user context menu interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.userContextMenu("userContextMenuId", userContextMenuMiddleware);
   * ```
   */
  userContextMenu(customId: string, ...fns: ContextMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("userContextMenu", customId, fns);
  }

  /**
   * Registers a message context menu interaction with its associated middleware.
   *
   * @example
   * ```ts
   * router.messageContextMenu("messageContextMenu", messageContextMenuMiddleware);
   * ```
   */
  messageContextMenu(customId: string, ...fns: ContextMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("messageContextMenu", customId, fns);
  }

  // protected httpInteractionPayloadHandler(
  //   body: APIInteraction,
  //   res: HttpAdapterSererResponse
  // ) {
  protected async httpInteractionPayloadHandler(
    body: APIInteraction,
    res: HttpAdapterSererResponse
  ) {
    if (body.type === InteractionType.Ping) {
      this.debug("Received PING");
      res.writeHead(200, {
        "Content-Type": "application/json",
      });
      return res.end(
        JSON.stringify({
          type: InteractionResponseType.Pong,
        })
      );
    }
    this.debug("Interaction Request Received");
    // this.router.__internal_dispatch(res, body, this.client);
    await this.router.__internal_dispatch(res, body, this.client);
  }
  async getRegistar(log = true) {
    const commandsBody = this.router.CommandDefinitions;
    console.log("route:", Routes.currentApplication().toString());
    var currentClient: APIApplication;
    try {
      currentClient = (await this.client.get(
        Routes.currentApplication()
      )) as APIApplication;
    } catch (e) {
      console.error(e);
      throw Error("[discord.https] Failed to fetch client!");
    }
    if (log) {
      console.log(
        chalk.bold(chalk.cyan("Client ID: ")) + chalk.green(currentClient.id)
      );
      console.log(
        chalk.bold(chalk.cyan("Client Name: ")) +
          chalk.green(currentClient.name)
      );
      console.log(
        chalk.bold(chalk.cyan("Approximate Guild Count: ")) +
          (currentClient.approximate_guild_count
            ? chalk.green(currentClient.approximate_guild_count)
            : chalk.redBright("unknown"))
      );
      console.log(
        chalk.bold(chalk.cyan("Approximate User Install Count: ")) +
          (currentClient.approximate_user_install_count
            ? chalk.green(currentClient.approximate_user_install_count)
            : chalk.redBright("unknown"))
      );
    }
    var upperThis = this;
    return {
      async globalSlashRegistar() {
        if (log) {
          console.log(
            chalk.bold(
              chalk.yellow("Starting global slash command registration...")
            )
          );
        }

        try {
          await upperThis.client.put(
            Routes.applicationCommands(currentClient.id),
            { body: commandsBody }
          );

          // Log success
          if (log) {
            console.log(
              chalk.bold(
                chalk.green("Successfully registered global slash commands!")
              )
            );
          }
        } catch (error) {
          // Log error if registration fails
          if (log) {
            console.log(
              chalk.bold(
                chalk.redBright(
                  "Error during global slash command registration:"
                )
              )
            );
            console.error(error);
          }
        }
      },
      async localSlashRegistar(guildId: string) {
        // Log before starting the local registration
        if (log) {
          console.log(
            chalk.bold(
              chalk.yellow(
                `Starting local slash command registration for Guild ID: ${guildId}...`
              )
            )
          );
        }

        try {
          await upperThis.client.put(
            Routes.applicationGuildCommands(currentClient.id, guildId),
            { body: commandsBody }
          );
          if (log)
            console.log(
              chalk.bold(
                chalk.green("Successfully registered local slash commands!")
              )
            );
        } catch (error) {
          if (log) {
            console.log(
              chalk.bold(
                chalk.redBright(
                  "Error during local slash command registration:"
                )
              )
            );
            console.error(error);
          }
        }
      },
    };
  }
}

export default Client;
