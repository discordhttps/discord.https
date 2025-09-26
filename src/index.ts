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
  GenericMiddleware,
} from "./interactionRouter/internal.js";

import type { MessageMentionOptions } from "discord.js";

export interface ClientOptions {
  token: string;
  publicKey: string;
  httpAdapter: HttpAdapter;
  debug?: boolean;
}

/**
 * Discord HTTPS Interaction Client.
 *
 * Handles registration of commands, buttons, modals, select menus, context menus,
 * and autocomplete interactions with their associated middleware.
 *
 * Also exposes a {@link REST} client for direct API calls.
 *
 * @example
 * ```ts
 * import Client, { InteractionResponseType } from "./Client.js";
 * import NodeAdapter from "@discordhttps/nodejs-adapter";
 *
 * const client = new Client({
 *   token: process.env.BOT_TOKEN!,
 *   publicKey: process.env.PUBLIC_KEY!,
 *   httpAdapter: new NodeAdapter(),
 * });
 *
 * client.command(
 *   (builder) => builder.setName("ping").setDescription("Replies with Pong!"),
 *   async (interaction, client, _, res) => {
 *     res.writeHead(200, {
 *       "Content-Type": "application/json",
 *     });
 *     const username = interaction.user
 *       ? interaction.user.global_name
 *       : interaction.member.user.global_name;
 *     res.end(
 *       JSON.stringify({
 *         type: InteractionResponseType.ChannelMessageWithSource,
 *         data: {
 *           content: `Hello! ${username}`,
 *         },
 *       })
 *     );
 *   }
 * );
 *
 * await client.listen("interactions", 3000, () => {
 *   console.log(
 *     "Listening for interactions on port 3000 at the /interactions endpoint"
 *   );
 * });
 * ```
 */

class Client extends HttpInteractionServer {
  /** Interaction router manager responsible for routing incoming interactions. */
  private router = new InteractionRouterManger();

  /**
   * REST API client instance used for interacting with Discord's HTTP API.
   *
   * @see {@link https://discord.js.org/docs/packages/rest/main | REST Documentation}
   */
  readonly rest!: REST;

  /**
   * Creates a new Discord HTTPS Interaction Client.
   *
   * @param options - Client configuration options.
   * @param options.token - Discord bot token.
   * @param options.publicKey - Discord public key for interaction verification.
   * @param options.httpAdapter - HTTP adapter to handle incoming requests.
   * @param options.debug - Optional. Enable debug logging. Defaults to `false`.
   */

  constructor({ httpAdapter, publicKey, token, debug = false }: ClientOptions) {
    super(publicKey, httpAdapter, debug);
    Object.defineProperty(this, "rest", {
      value: new REST({
        version: "10",
      }),
    });
    this.rest.setToken(token);
  }

  /**
   * Registers interaction routes.
   *
   * @param routes - {@link InteractionRouter} or {@link InteractionRouterCollector} instances.
   */

  register(...routes: Array<InteractionRouter | InteractionRouterCollector>) {
    this.router.register(...routes);
  }

  /**
   * Adds global middleware that runs on every interaction.
   *
   * Receives raw {@link APIInteraction} payload and response object.
   *
   * @param fns - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
   *
   */

  middleware(...fns: GeneralMiddleware[]) {
    this.router.middlewares.push(...fns);
  }

  /**
   * Adds global middleware for unknown interactions.
   *
   * @param fns - Async Functions executed when no handler matches an interaction. See {@link UnknownMiddleware} for callback parameters.
   */
  unknown(...fns: UnknownMiddleware[]) {
    this.router._unknownInteraction.push(...fns);
  }

  /**
   * Ensures all middleware functions are async.
   *
   * @internal
   * @param fns - Functions to check.
   * @throws If any function is not async.
   */
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
   * @param commandbuilder - Function returning a {@link SlashCommandBuilder}.
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
   * @returns {@link AutoCompleteKeyBuilder} for autocomplete options.
   * @example
   *
   * ```ts
   * router.command(
   *   (builder) =>
   *     builder.setName("Ping!").setDescription("Returns Pong!"),
   *     pongHandle
   * );
   * ```
   *
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
   * @param fns - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
   * @example
   * ```ts
   * const githubQuery = router.command(
   *   (builder) =>
   *     builder
   *       .setName("weather")  // The command name
   *       .setDescription("Query weather information!")  // The command description
   *       .addStringOption(option =>
   *         option
   *           .setName("city")  // Option name
   *           .setDescription("City to get the weather for")  // Option description
   *           .setAutocomplete(true) // Enable autocomplete for this option
   *       ),
   *   handler
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
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
   * @param fns {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function | Async} functions. See {@link GenericMiddleware} for callback parameters.
   * @example
   * ```ts
   * router.messageContextMenu("messageContextMenu", messageContextMenuMiddleware);
   * ```
   */
  messageContextMenu(customId: string, ...fns: ContextMenuMiddleware[]) {
    this.tryAsync(fns);
    this.router._register("messageContextMenu", customId, fns);
  }
  /**
   * Handles incoming interaction payloads from Discord.
   *
   * @internal
   * @param body - The raw {@link APIInteraction} payload.
   * @param res - HTTP response object to reply to Discord.
   */
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
    await this.router.__internal_dispatch(res, body, this.rest);
  }

  /**
   * Returns helpers for registering slash commands.
   *
   * @param log - Log progress. Defaults to true.
   * @returns Methods to register commands globally or locally.
   */
  async getRegistar(log = true) {
    const commandsBody = this.router.CommandDefinitions;
    var currentClient: APIApplication;
    try {
      currentClient = (await this.rest.get(
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
            : chalk.redBright("0"))
      );
      console.log(
        chalk.bold(chalk.cyan("Approximate User Install Count: ")) +
          (currentClient.approximate_user_install_count
            ? chalk.green(currentClient.approximate_user_install_count)
            : chalk.redBright("0"))
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
          await upperThis.rest.put(
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
          await upperThis.rest.put(
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
export * from "@discordjs/builders";
export * from "discord-api-types/v10";
