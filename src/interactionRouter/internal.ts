import AutoCompleteKeyBuilder from "./autoCompleteKeyBuilder.js";
import { InteractionRouter, InteractionRouterCollector } from "./index.js";
import ChatInputCommandInteraction from "../structures/ChatInputCommandInteraction.js";

import type { REST } from "@discordjs/rest";
import type { HttpAdapterSererResponse } from "../adapter/index.js";

import type {
  DiscordHttpsAPIInteraction,
  DiscordHttpsInteraction,
} from "../structures/BaseInterction.js";

// Context
import type {
  APIContextMenuInteraction,
  APIMessageApplicationCommandInteraction,
  APIUserApplicationCommandInteraction,
} from "discord-api-types/v10";

// SELECT
import type {
  APIMessageComponentSelectMenuInteraction,
  APIMessageRoleSelectInteractionData,
  APIMessageUserSelectInteractionData,
  APIMessageStringSelectInteractionData,
  APIMessageChannelSelectInteractionData,
  APIMessageMentionableSelectInteractionData,
} from "discord-api-types/v10";

// Modal
import type { APIModalSubmitInteraction } from "discord-api-types/v10";

// Button
import type { APIMessageButtonInteractionData } from "discord-api-types/v10";

// slash command
import { APIChatInputApplicationCommandInteraction } from "discord-api-types/v10";

// Autocomplete
import type { APIApplicationCommandAutocompleteInteraction } from "discord-api-types/v10";

// Types {data.type, interaction.type}
import {
  ComponentType,
  InteractionType,
  ApplicationCommandType,
} from "discord-api-types/v10";

import { SlashCommandBuilder } from "@discordjs/builders";

export interface Context {
  client: REST;
  resolvedInteraction:
    | DiscordHttpsInteraction
    | DiscordHttpsAPIInteraction
    | APIMessageButtonInteractionData
    | APIModalSubmitInteraction
    | APIMessageComponentSelectMenuInteraction
    | APIApplicationCommandAutocompleteInteraction
    | APIContextMenuInteraction;
}

export type GenericMiddleware<T = Context["resolvedInteraction"]> = (
  interaction: T,
  client: Readonly<REST>,
  flush: () => never,
  // `res` will be removed in the near future, as the structure is complete.
  res: HttpAdapterSererResponse
) => Promise<void>;

export type GeneralMiddleware = GenericMiddleware<
  DiscordHttpsInteraction | DiscordHttpsAPIInteraction
>;

export type CommandMiddleware = GenericMiddleware<ChatInputCommandInteraction>;

export type ButtonMiddleware =
  GenericMiddleware<APIMessageButtonInteractionData>;

export type ModalMiddleware = GenericMiddleware<APIModalSubmitInteraction>;

export type StringSelectMenuMiddleware =
  GenericMiddleware<APIMessageComponentSelectMenuInteraction>;

export type RoleSelectMenuMiddleware =
  GenericMiddleware<APIMessageRoleSelectInteractionData>;

export type UserSelectMenuMiddleware =
  GenericMiddleware<APIMessageUserSelectInteractionData>;

export type MentionableSelectMenuMiddleware =
  GenericMiddleware<APIMessageMentionableSelectInteractionData>;

export type ChannelSelectMenuMiddleware =
  GenericMiddleware<APIMessageChannelSelectInteractionData>;

export type SelectMenuMiddleware =
  | StringSelectMenuMiddleware
  | RoleSelectMenuMiddleware
  | UserSelectMenuMiddleware
  | MentionableSelectMenuMiddleware
  | ChannelSelectMenuMiddleware;

export type AutoCompleteMiddleware =
  GenericMiddleware<APIApplicationCommandAutocompleteInteraction>;

export type UserContextMenuMiddleware =
  GenericMiddleware<APIMessageApplicationCommandInteraction>;
export type MenuContextMenuMiddleware =
  GenericMiddleware<APIUserApplicationCommandInteraction>;

export type ContextMenuMiddleware =
  | UserContextMenuMiddleware
  | MenuContextMenuMiddleware;

// export type UnknownMiddleware = GenericMiddleware<DiscordHttpsAPIInteraction>;
export type UnknownMiddleware<T = DiscordHttpsAPIInteraction> = (
  interaction: T,
  client: Readonly<REST>,
  flush: () => never,
  // `res` should be provided to unknown middlewares only, as `UnknownMiddleware` is meant to be used
  // only when the library doesn't cover that specific interaction.
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
export type CommandDefinitionType = ReturnType<
  (typeof SlashCommandBuilder)["prototype"]["toJSON"]
>;

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

class InteractionRouterManager {
  middlewares: GenericMiddleware<DiscordHttpsInteraction>[] = [];
  _unknownInteraction: GenericMiddleware<DiscordHttpsAPIInteraction>[] = [];
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

  public CommandDefinitions: Array<
    ReturnType<(typeof SlashCommandBuilder)["prototype"]["toJSON"]>
  > = [];

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
    interaction: DiscordHttpsAPIInteraction
  ): ResolvedRoute {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand:
        switch (interaction.data.type) {
          case ApplicationCommandType.ChatInput:
            return {
              routeKey: "command",
              routeHandlerKey: interaction.data.name,
              // interaction: new ChatInputCommandInteraction(client, interaction),
              resolvedInteraction: interaction,
            };

          case ApplicationCommandType.User:
            return {
              routeKey: "userContextMenu",
              routeHandlerKey: interaction.data.name,
              resolvedInteraction: interaction,
            };

          case ApplicationCommandType.Message:
            return {
              routeKey: "messageContextMenu",
              routeHandlerKey: interaction.data.name,
              resolvedInteraction: interaction,
            };
        }
        break;
      case InteractionType.MessageComponent:
        switch (interaction.data.component_type) {
          case ComponentType.Button:
            return {
              routeKey: "messageContextMenu",
              routeHandlerKey: interaction.data.custom_id,
              resolvedInteraction: interaction,
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
          resolvedInteraction: interaction,
        };

      case InteractionType.ModalSubmit:
        return {
          routeKey: "modal",
          routeHandlerKey: interaction.data.custom_id,
          resolvedInteraction: interaction,
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
    client: REST
  ) {
    const routeData = this.mapInteractionToRoute(incomingInteraction);
    if (routeData.routeKey === "unknown") {
      const ctx: Context = {
        client,
        resolvedInteraction: incomingInteraction,
      };

      const middlewareStack = [
        ...this.middlewares,
        ...this._unknownInteraction,
      ];
      ``;
      await this._runMiddlewareStack(ctx, middlewareStack, res);
    } else {
      const route = this.routeStack[routeData.routeKey];
      const globalMiddlewares = this.middlewares;
      const unknownMiddlewares = route.get(routeData.routeHandlerKey);
      if (!unknownMiddlewares)
        return this._afterMiddleware(incomingInteraction, client, res);
      const middlewareStack = [...globalMiddlewares, ...unknownMiddlewares];
      const ctx: Context = {
        client,
        resolvedInteraction: routeData.resolvedInteraction,
      };
      await this._runMiddlewareStack(ctx, middlewareStack, res);
    }
  }

  async _runMiddlewareStack(
    ctx: Context,
    stack: Array<
      | GeneralMiddleware
      | UnknownMiddleware
      | CommandMiddleware
      | ButtonMiddleware
      | ModalMiddleware
      | SelectMenuMiddleware
      | AutoCompleteMiddleware
      | ContextMenuMiddleware
    >,
    res: HttpAdapterSererResponse
  ) {
    const flush = () => {
      throw new Error("FLUSH_MIDDLEWARE");
    };

    try {
      for (const middleware of stack) {
        // `res` will be removed in the near future, as the structure is complete.
        await middleware(
          ctx.resolvedInteraction as any,
          ctx.client,
          flush,
          res
        );
      }
    } catch (err) {
      if ((err as Error).message !== "FLUSH_MIDDLEWARE") {
        throw err; // propagate real errors
      }
    }
    this._afterMiddleware(ctx.resolvedInteraction, ctx.client, res);
  }

  _afterMiddleware(
    interaction: Context["resolvedInteraction"],
    client: REST,
    res: HttpAdapterSererResponse
  ) {
    if (res.headersSent) return;
    res.writeHead(204);
    res.end();
  }
}

export default InteractionRouterManager;
