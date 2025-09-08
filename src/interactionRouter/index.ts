import AutoCompleteKeyBuilder from "./autoCompleteKeyBuilder.js";
import type {
  CommandDefinitionType,
  CommandbuilderType,
  AutoCompleteMiddleware,
  ButtonMiddleware,
  CommandMiddleware,
  ContextMenuMiddleware,
  GeneralMiddleware,
  ModalMiddleware,
  SelectMenuMiddleware,
  GenericMiddleware,
  RouteStack,
} from "./internal.js";

import { DiscordHttpsInteraction } from "../structures/BaseInterction.js";

import { SlashCommandBuilder } from "@discordjs/builders";

/**
 * A router that handles interactions in Discord, registering middleware for various types of interactions.
 *
 * @example
 * ```ts
 * const router = new InteractionRouter();
 * export deafult router.command(
 *   (builder) => builder.setName("Ping!").setDescription("Returns Pong!"),
 *   (interaction) => interaction.reply({ content: "pong!" })
 * );
 * ```
 */

class InteractionRouter {
  /**
   * @internal
   * Middlewares that run on every interaction before routing.
   * Not meant for public use.
   */
  __internal_middlewares: GenericMiddleware<DiscordHttpsInteraction>[] = [];

  /**
   * @internal
   * The internal routing stack for commands, buttons, selects, etc.
   * Used internally to map interaction types to handlers.
   */
  __internal_routeStack: RouteStack = {
    command: new Map(),
    button: new Map(),
    channelSelect: new Map(),
    mentionableSelect: new Map(),
    roleSelect: new Map(),
    stringSelect: new Map(),
    userSelect: new Map(),
    userContextMenu: new Map(),
    messageContextMenu: new Map(),
    autocomplete: new Map(),
    modal: new Map(),
  };

  /**
   * @internal
   * Stores all command definitions for registration with Discord.
   * This is not intended for external access.
   */
  public CommandDefinitions: Array<CommandDefinitionType> = [];

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

  middleware(...fns: GeneralMiddleware[]) {
    this.tryAsync(fns);
    this.__internal_middlewares.push(...fns);
  }

  /**
   * Registers a command with its associated middleware.
   *
   * @example
   * ```ts
   * router.command(
   *   (builder) => builder.setName("Ping!").setDescription("Returns Pong!"),
   *   async(interaction) => interaction.reply({ content: "pong!" })
   * );
   * ```
   */
  command(commandbuilder: CommandbuilderType, ...fns: CommandMiddleware[]) {
    this.tryAsync(fns);

    const build = commandbuilder(new SlashCommandBuilder());
    this._register("command", build.name, fns);

    const commandDefinition = build.toJSON();
    this.CommandDefinitions.push(commandDefinition);

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
    this._register("button", customId, fns);
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
    this._register("modal", customId, fns);
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
    this._register("roleSelect", name, fns);
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
    this._register("userSelect", name, fns);
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
    this._register("stringSelect", name, fns);
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
    this._register("channelSelect", name, fns);
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
    this._register("mentionableSelect", name, fns);
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
    this._register("autocomplete", AutoCompleteKeyBuilder._resolve(key), fns);
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
    this._register("userContextMenu", customId, fns);
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
    this._register("messageContextMenu", customId, fns);
  }

  /**
   * @internal
   * push method into stack
   */
  private _register(type: keyof RouteStack, name: string, middlewares: any[]) {
    if (middlewares.length === 0)
      this.throwError("At least one middleware or callback is required");

    const routeMap = this.__internal_routeStack[type] as Map<string, any[]>;
    if (!routeMap.has(name)) {
      routeMap.set(name, []);
    }
    routeMap.get(name)!.push(...middlewares);
  }

  private throwError(message: string) {
    throw new Error(`[class:InteractionRouter - discord.https] ${message}`);
  }
}

/**
 * Collector for InteractionRouter.
 *
 *  @example
 * ```ts
 * import { InteractionRouter, InteractionRouterCollector } from 'discord.https/route';
 *
 * const router = new InteractionRouter()
 * router.command(
 * (builder) => builder.setName("Ping!").setDescription("Returns Pong!")
 * (interaction) => interaction.reply({
 * content: "pong!"
 * })
 * )
 * // Register routes
 * InteractionRouterCollector.register(router);
 * ```
 */

class InteractionRouterCollector {
  /**
   * The internal routing stack for commands, buttons, selects, etc.
   * Used internally to map interaction types to handlers.
   *
   * @internal
   */
  __internal_collectedRoutes: InteractionRouter[] = [];
  register(
    ...routes: (typeof InteractionRouter | InteractionRouterCollector)[]
  ) {
    routes.forEach((route) => {
      if (route instanceof InteractionRouter) {
        this.__internal_collectedRoutes.push(route);
      } else if (route instanceof InteractionRouterCollector) {
        // Merge existing routes from another collector
        this.__internal_collectedRoutes.push(
          ...route.__internal_collectedRoutes
        );
      } else
        throw new Error(
          "[InteractionRouterCollector - discord.https] Invalid route was provided"
        );
    });
    return this;
  }
}

export { InteractionRouter, InteractionRouterCollector };
