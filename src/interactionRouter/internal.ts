import { AutoCompleteKeyBuilder } from "./autoCompleteKeyBuilder.js";
import { InteractionRouter, InteractionRouterCollector } from "./index.js";

// Context
import { UserContextMenuInteraction } from "../structures/Interaction/ApplicationCommandInteraction/ContextMenuInteraction/UserContext.js";
import { MessageContextMenuInteraction } from "../structures/Interaction/ApplicationCommandInteraction/ContextMenuInteraction/MessageContext.js";

// slash
import { ChatInputCommandInteraction } from "../structures/Interaction/ApplicationCommandInteraction/ChatInputCommandInteraction.js";

// Autocomplete
import { AutoCompleteInteraction } from "../structures/Interaction/AutocompleteInteraction/AutocompleteInteraction.js";

// ModalSubmit
import { ModalSubmitInteraction } from "../structures/Interaction/ModalSubmitInteraction/ModalSubmitInteraction.js";

// Select
import { UserSelectMenuInteraction } from "../structures/Interaction/MessageComponentInteraction/Select/UserSelectComponent.js";
import { RoleSelectMenuInteraction } from "../structures/Interaction/MessageComponentInteraction/Select/RoleSelectMenuInteraction.js";
import { ChannelSelectMenuInteraction } from "../structures/Interaction/MessageComponentInteraction/Select/ChannelSelectMenuInteraction.js";
import { MentionableSelectMenuInteraction } from "../structures/Interaction/MessageComponentInteraction/Select/MentionableSelectMenuInteraction.js";
import { StringSelectMenuInteraction } from "../structures/Interaction/MessageComponentInteraction/Select/StringSelectMenuInteraction.js";

// Button
import { ButtonInteraction } from "../structures/Interaction/MessageComponentInteraction/ButtonInteraction.js";

import type { HttpAdapterSererResponse } from "../adapter/index.js";

import type {
  DiscordHttpsAPIInteraction,
  DiscordHttpsInteraction,
} from "../structures/Interaction/BaseInterction.js";

// Context
import type {
  APIContextMenuInteraction,
  APIUserApplicationCommandInteraction,
  APIMessageApplicationCommandInteraction,
  RESTPostAPIContextMenuApplicationCommandsJSONBody,
} from "discord-api-types/v10";

// Modal
import type { APIModalSubmitInteraction } from "discord-api-types/v10";

// Button & SELECT
import type { APIMessageComponentInteraction } from "discord-api-types/v10";

// slash command
import type {
  APIChatInputApplicationCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord-api-types/v10";

// Autocomplete
import type { APIApplicationCommandAutocompleteInteraction } from "discord-api-types/v10";

// Types {data.type, interaction.type}
import {
  ComponentType,
  InteractionType,
  ApplicationCommandType,
} from "discord-api-types/v10";

import type Client from "../index.js";

import {
  SlashCommandBuilder,
  ContextMenuCommandBuilder,
} from "@discordjs/builders";

export interface Context {
  readonly client: Client;
  isUnknownMiddleware: boolean;
  resolvedInteraction: DiscordHttpsInteraction | DiscordHttpsAPIInteraction;
}

/**
 * A middleware function executed during an HTTP interaction lifecycle.
 *
 * @typeParam T - The specific interaction type handled by the middleware.
 *   Defaults to {@link Context.resolvedInteraction | Context["resolvedInteraction"]}.
 */
export type GenericMiddleware<T = Context["resolvedInteraction"]> = (
  /**
   * The resolved interaction for this request.
   */
  interaction: T,

  /**
   * A read-only {@link Client} instance.
   * Use this to perform Discord REST API calls safely.
   */
  client: Readonly<Client>,

  /**
   * A function you can call to immediately stop further
   * middleware execution and end the request.
   */
  flush: () => never
) => Promise<void>;

export type GeneralMiddleware = GenericMiddleware<
  DiscordHttpsInteraction | DiscordHttpsAPIInteraction
>;

export type CommandMiddleware = GenericMiddleware<ChatInputCommandInteraction>;

export type ButtonMiddleware = GenericMiddleware<ButtonInteraction>;

export type ModalMiddleware = GenericMiddleware<ModalSubmitInteraction>;

export type StringSelectMenuMiddleware =
  GenericMiddleware<StringSelectMenuInteraction>;

export type RoleSelectMenuMiddleware =
  GenericMiddleware<RoleSelectMenuInteraction>;

export type UserSelectMenuMiddleware =
  GenericMiddleware<UserSelectMenuInteraction>;

export type MentionableSelectMenuMiddleware =
  GenericMiddleware<MentionableSelectMenuInteraction>;

export type ChannelSelectMenuMiddleware =
  GenericMiddleware<ChannelSelectMenuInteraction>;

export type SelectMenuMiddleware =
  | StringSelectMenuMiddleware
  | RoleSelectMenuMiddleware
  | UserSelectMenuMiddleware
  | MentionableSelectMenuMiddleware
  | ChannelSelectMenuMiddleware;

export type AutoCompleteMiddleware =
  GenericMiddleware<APIApplicationCommandAutocompleteInteraction>;

export type MessageContextMenuMiddleware =
  GenericMiddleware<MessageContextMenuInteraction>;
export type UserContextMenuMiddleware =
  GenericMiddleware<UserContextMenuInteraction>;

export type ContextMenuMiddleware =
  | MessageContextMenuMiddleware
  | UserContextMenuMiddleware;

// export type UnknownMiddleware = GenericMiddleware<DiscordHttpsAPIInteraction>;

/**
 * A middleware type for interactions that the library
 * does not explicitly cover.
 *
 * @typeParam T - The Discord HTTPS API interaction type.
 *   Defaults to {@link DiscordHttpsAPIInteraction}.
 */
export type UnknownMiddleware<T = DiscordHttpsAPIInteraction> = (
  /**
   * The raw Discord HTTPS API interaction.
   */
  interaction: T,
  /**
   * A read-only {@link Client} client instance.
   */
  client: Readonly<Client>,
  /**
   * Ends the middleware chain immediately.
   * Calling `flush()` stops further middleware and never returns.
   */
  flush: () => never,
  /**
   * The underlying {@link HttpAdapterSererResponse} object.
   *
   * `res` should be provided to unknown middlewares only,
   * as {@link UnknownMiddleware} is meant to be used when the
   * library does not yet cover a specific interaction.
   */
  res: HttpAdapterSererResponse
) => Promise<void>;

export type UnionMiddleware =
  | UnknownMiddleware
  | ButtonMiddleware
  | ModalMiddleware
  | SelectMenuMiddleware
  | AutoCompleteMiddleware
  | ContextMenuMiddleware
  | CommandMiddleware
  | GeneralMiddleware;

export interface RouteStack {
  command: Map<string, CommandMiddleware[]>;
  button: Map<string, ButtonMiddleware[]>;
  modal: Map<string, ModalMiddleware[]>;
  autocomplete: Map<string, AutoCompleteMiddleware[]>;

  roleSelect: Map<string, SelectMenuMiddleware[]>;
  stringSelect: Map<string, StringSelectMenuMiddleware[]>;
  channelSelect: Map<string, SelectMenuMiddleware[]>;
  mentionableSelect: Map<string, SelectMenuMiddleware[]>;
  userSelect: Map<string, SelectMenuMiddleware[]>;

  userContextMenu: Map<string, ContextMenuMiddleware[]>;
  messageContextMenu: Map<string, ContextMenuMiddleware[]>;
}

export type CommandbuilderType = (
  builder: SlashCommandBuilder
) => SlashCommandBuilder;

export type userContextCommandBuilderType = (
  builder: ReturnType<typeof userContextCommandBuilder>
) => SlashCommandBuilder;

export type messageContextCommandBuilderType = (
  builder: ReturnType<typeof messageContextCommandBuilder>
) => SlashCommandBuilder;

export type CommandDefinitionType =
  | RESTPostAPIContextMenuApplicationCommandsJSONBody
  | RESTPostAPIChatInputApplicationCommandsJSONBody;

interface KnownRoute {
  routeKey: keyof RouteStack;
  routeHandlerKey: string;
  resolvedInteraction: DiscordHttpsInteraction | DiscordHttpsAPIInteraction;
}

interface UnknownRoute {
  routeKey: "unknown";
  interaction: DiscordHttpsAPIInteraction;
}

type ResolvedRoute = KnownRoute | UnknownRoute;

/**
 *
 * @internal
 *
 * Manages registration and routing of Discord interaction middlewares.
 *
 * The `InteractionRouterManager` stores middleware stacks for
 * different Discord interaction types (commands, buttons, selects,
 * context menus, etc.) and provides a registry for both known and
 * unknown routes.
 *
 */

export class InteractionRouterManager {
  middlewares: GenericMiddleware<DiscordHttpsInteraction>[] = [];
  _unknownInteraction: UnknownMiddleware<DiscordHttpsAPIInteraction>[] = [];
  routeStack: RouteStack = {
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

  public CommandDefinitions: Array<CommandDefinitionType> = [];

  constructor(public isDebug = false) {
    this.isDebug = isDebug;
  }

  register(...routes: Array<InteractionRouter | InteractionRouterCollector>) {
    routes.forEach((route) => {
      if (route instanceof InteractionRouter) {
        this.mergeRoute(route);
      } else if (route instanceof InteractionRouterCollector) {
        route.__internal_collectedRoutes.forEach((route_) => {
          this.mergeRoute(route_);
        });
      }
    });
  }

  protected debug(...message: string[]) {
    if (this.isDebug) {
      const datePrefix = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      return console.debug(
        `${datePrefix} [class:InteractionRouter - discord.https]`,
        ...message
      );
    }
  }

  mergeRoute(route: InteractionRouter) {
    // Merge unknown handlers
    for (const [routeKey, routeMap] of Object.entries(
      route.__internal_routeStack
    ) as [keyof RouteStack, Map<string, Context["resolvedInteraction"]>][]) {
      for (const [key, middlewares] of routeMap) {
        if (!this.routeStack[routeKey].has(key)) {
          this.routeStack[routeKey].set(key, []);
        }
        // Merge route level middlewares
        this.routeStack[routeKey]
          .get(key)!
          .push(
            ...(route.__internal_middlewares as any),
            ...(middlewares as any)
          );
        this.debug(`Registered interaction route ${routeKey} — ${key}`);
      }
    }
    // Merge command definitions
    this.CommandDefinitions.push(...route.CommandDefinitions);
  }

  _register(
    type: keyof RouteStack,
    key: string,
    middlewares: Array<UnionMiddleware>
  ) {
    if (middlewares.length === 0)
      this.throwError("At least one middleware or callback is required");

    const routeMap = this.routeStack[type];
    if (!routeMap.has(key)) {
      routeMap.set(key, []);
    }
    routeMap.get(key)!.push(...(middlewares as any));
  }

  private throwError(message: string) {
    throw new Error(`[class:InteractionRouter - discord.https] ${message}`);
  }

  mapInteractionToRoute(
    client: Client,
    interaction: DiscordHttpsAPIInteraction,
    res: HttpAdapterSererResponse
  ): ResolvedRoute {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        switch (interaction.data.type) {
          case ApplicationCommandType.ChatInput:
            return {
              routeKey: "command",
              routeHandlerKey: interaction.data.name,
              resolvedInteraction: new ChatInputCommandInteraction(
                client,
                interaction as APIChatInputApplicationCommandInteraction,
                res
              ),
            };

          case ApplicationCommandType.User:
            return {
              routeKey: "userContextMenu",
              routeHandlerKey: interaction.data.name,
              resolvedInteraction: new UserContextMenuInteraction(
                client,
                interaction as APIUserApplicationCommandInteraction,
                res
              ),
            };

          case ApplicationCommandType.Message:
            return {
              routeKey: "messageContextMenu",
              routeHandlerKey: interaction.data.name,
              resolvedInteraction: new MessageContextMenuInteraction(
                client,
                interaction as APIMessageApplicationCommandInteraction,
                res
              ),
            };
        }
        break;
      case InteractionType.MessageComponent:
        switch (interaction.data.component_type) {
          case ComponentType.Button:
            return {
              routeKey: "button",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: new ButtonInteraction(
                client,
                interaction as APIMessageComponentInteraction,
                res
              ),
            };
          case ComponentType.RoleSelect:
            return {
              routeKey: "roleSelect",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: interaction,
            };
          case ComponentType.UserSelect:
            return {
              routeKey: "userSelect",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: interaction,
            };
          case ComponentType.StringSelect:
            return {
              routeKey: "stringSelect",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: interaction,
            };
          case ComponentType.ChannelSelect:
            return {
              routeKey: "channelSelect",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: interaction,
            };
          case ComponentType.MentionableSelect:
            return {
              routeKey: "mentionableSelect",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: interaction,
            };
        }
      case InteractionType.ApplicationCommandAutocomplete:
        return {
          routeKey: "autocomplete",
          routeHandlerKey: AutoCompleteKeyBuilder._resolve(interaction),
          resolvedInteraction: new AutoCompleteInteraction(
            client,
            interaction as APIApplicationCommandAutocompleteInteraction,
            res
          ),
        };

      case InteractionType.ModalSubmit:
        return {
          routeKey: "modal",
          routeHandlerKey: interaction.data.custom_id,
          resolvedInteraction: new ModalSubmitInteraction(
            client,
            interaction as APIModalSubmitInteraction,
            res
          ),
        };
    }
    return {
      routeKey: "unknown",
      interaction,
    };
  }

  /**
   * @internal
   * @hidden
   *
   * Dispatches an incoming interaction to the appropriate route.
   * This method is intended for internal use only and should not
   * be called directly by consumers of the library.
   *
   */
  async __internal_dispatch(
    res: HttpAdapterSererResponse,
    incomingInteraction: DiscordHttpsAPIInteraction,
    client: Client
  ) {
    this.debug("The internal dispatcher has been invoked");
    const routeData = this.mapInteractionToRoute(
      client,
      incomingInteraction as DiscordHttpsAPIInteraction,
      res
    );
    if (routeData.routeKey === "unknown") {
      const ctx: Context = {
        client,
        resolvedInteraction: incomingInteraction,
        isUnknownMiddleware: true,
      };

      const middlewareStack = [
        // Middleware will not be fired for unknown middlewares.
        // ...this.middlewares,
        ...this._unknownInteraction,
      ];
      await this._runMiddlewareStack(ctx, middlewareStack, res);
    } else {
      const route = this.routeStack[routeData.routeKey];
      const globalMiddlewares = this.middlewares;
      const knownMiddlewares = route.get(routeData.routeHandlerKey);
      if (!knownMiddlewares)
        return this._autoFlusher(incomingInteraction, client, res);
      const middlewareStack = [...globalMiddlewares, ...knownMiddlewares];
      const ctx: Context = {
        client,
        resolvedInteraction: routeData.resolvedInteraction,
        isUnknownMiddleware: false,
      };

      Object.defineProperty(ctx, "client", {
        writable: false,
        configurable: false,
        enumerable: false,
      });

      this.debug(
        `Middleware stack has been created with length: ${middlewareStack.length}`
      );
      await this._runMiddlewareStack(ctx, middlewareStack, res);
    }
  }

  async _runMiddlewareStack(
    ctx: Context,
    stack: Array<
      | GeneralMiddleware
      | CommandMiddleware
      | ButtonMiddleware
      | ModalMiddleware
      | SelectMenuMiddleware
      | AutoCompleteMiddleware
      | ContextMenuMiddleware
      | UnknownMiddleware
    >,
    res: HttpAdapterSererResponse
  ): Promise<void> {
    const flush = () => {
      throw new Error("FLUSH_MIDDLEWARE");
    };
    this.debug(`Running middleware stack with ${stack.length} middleware(s)`);

    try {
      if (ctx.isUnknownMiddleware) {
        for (const middleware of stack) {
          await (middleware as any)(
            ctx.resolvedInteraction as any,
            ctx.client,
            flush
          );
        }
      } else {
        for (const middleware of stack) {
          await middleware(
            ctx.resolvedInteraction as any,
            ctx.client,
            flush,
            res
          );
        }
      }
    } catch (err) {
      if ((err as Error).message !== "FLUSH_MIDDLEWARE") {
        this.debug("Middleware stack threw an unexpected error");
        throw err; // propagate real errors
      }
    }
    this._autoFlusher(ctx.resolvedInteraction, ctx.client, res);
  }

  _autoFlusher(
    interaction: Context["resolvedInteraction"],
    client: Client,
    res: HttpAdapterSererResponse
  ) {
    if (res.headersSent) return;
    this.debug("AutoFlusher flushed response with 204 No Content");
    res.writeHead(204);
    res.end();
  }
}

export function userContextCommandBuilder() {
  const builder = new ContextMenuCommandBuilder();
  (builder as any).type = ApplicationCommandType.User;
  delete (builder as any).setType;
  return builder as Omit<ContextMenuCommandBuilder, "setType">;
}

export function messageContextCommandBuilder() {
  const builder = new ContextMenuCommandBuilder();
  (builder as any).type = ApplicationCommandType.Message;
  delete (builder as any).setType;
  return builder as Omit<ContextMenuCommandBuilder, "setType">;
}
