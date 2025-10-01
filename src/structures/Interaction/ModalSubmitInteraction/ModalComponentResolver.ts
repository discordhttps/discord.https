"use strict";

import { Collection } from "@discordjs/collection";
import {
  DiscordHttpsErrorCodes,
  DiscordHttpsTypeError,
} from "../../errors/index.js";
import Client from "../../../index.js";

import type {
  APIUser,
  APIGuildMember,
  APIRole,
  APIInteractionDataResolvedGuildMember,
  APIUserInteractionDataResolved,
  APIActionRowComponent,
  APILabelComponent,
  Snowflake,
  APIInteractionDataResolved,
  APITextDisplayComponent,
  APIInteractionDataResolvedChannel,
} from "discord-api-types/v10";

import { ComponentType, ChannelType } from "discord-api-types/v10";

import {
  InteractionResolvedData,
  transformResolved,
} from "../../utils/Util.js";

export type ModalSelectedMentionables = {
  users: Collection<string, APIUser>;
  members: Collection<string, APIInteractionDataResolvedGuildMember>;
  roles: Collection<string, APIRole>;
};

export interface BaseModalData<Type extends ComponentType> {
  id: number;
  type: Type;
}

export interface TextInputModalData
  extends BaseModalData<ComponentType.TextInput> {
  customId: string;
  value: string;
}

export interface SelectMenuModalData
  extends BaseModalData<
    | ComponentType.ChannelSelect
    | ComponentType.MentionableSelect
    | ComponentType.RoleSelect
    | ComponentType.StringSelect
    | ComponentType.UserSelect
  > {
  channels?: Collection<Snowflake, APIInteractionDataResolvedChannel>;
  customId: string;
  members?: Collection<Snowflake, APIInteractionDataResolvedGuildMember>;
  roles?: Collection<Snowflake, APIRole>;
  users?: Collection<Snowflake, APIUser>;
  values: readonly string[];
}

export interface ActionRowModalData
  extends BaseModalData<ComponentType.ActionRow> {
  components: readonly TextInputModalData[];
}

export type ModalData = SelectMenuModalData | TextInputModalData;

export interface LabelModalData extends BaseModalData<ComponentType.Label> {
  component: readonly ModalData[];
}

export interface TextDisplayModalData
  extends BaseModalData<ComponentType.TextDisplay> {}

/**
 * A resolver for modal submit components
 */
export class ModalComponentResolver {
  readonly resolved!: InteractionResolvedData;
  /**
   * @internal
   */
  readonly data: Array<
    ActionRowModalData | LabelModalData | TextDisplayModalData
  >;
  readonly hoistedComponents: Collection<string, ModalData>;

  constructor(
    readonly client: Client,
    components: Array<
      ActionRowModalData | LabelModalData | TextDisplayModalData
    >,
    resolved: APIInteractionDataResolved | undefined
  ) {
    /**
     * The client that instantiated this.
     */
    Object.defineProperty(this, "client", { value: client });

    /**
     * The interaction resolved data
     */
    Object.defineProperty(this, "resolved", {
      value: transformResolved(resolved),
    });

    /**
     * The components within the modal
     *
     */
    this.data = components;

    /**
     * The bottom-level components of the interaction
     *
     */
    this.hoistedComponents = components.reduce((accumulator, next) => {
      // For legacy support of action rows
      if ("components" in next) {
        for (const component of next.components)
          accumulator.set(component.customId, component);
      }

      // For label components
      if ("component" in next) {
        accumulator.set(
          (next.component as any).customId,
          next.component as any
        );
      }

      return accumulator;
    }, new Collection<string, ModalData>());
  }

  /**
   * Gets a component by custom id.
   *
   * @property customId The custom id of the component.
   * @returns
   */
  getComponent(customId: string): ModalData {
    const component = this.hoistedComponents.get(customId);

    if (!component)
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.ModalSubmitInteractionComponentNotFound,
        customId
      );

    return component;
  }

  /**
   * Gets a component by custom id and property and checks its type.
   *
   * @param customId The custom id of the component.
   * @param allowedTypes The allowed types of the component.
   * @param properties The properties to check for for `required`.
   * @param required Whether to throw an error if the component value(s) are not found.
   * @returns  The option, if found.
   */
  private _getTypedComponent(
    customId: string,
    allowedTypes: ComponentType[],
    properties?: string[],
    required?: boolean
  ): ModalData {
    const component = this.getComponent(customId);
    if (!allowedTypes.includes(component.type)) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.ModalSubmitInteractionComponentType,
        customId,
        component.type,
        allowedTypes.join(", ")
      );
    } else if (
      required &&
      properties?.every(
        (prop) =>
          (component as any)[prop] === null ||
          (component as any)[prop] === undefined
      )
    ) {
      throw new DiscordHttpsTypeError(
        DiscordHttpsErrorCodes.ModalSubmitInteractionComponentEmpty,
        customId,
        component.type
      );
    }

    return component;
  }

  /**
   * Gets the value of a text input component
   *
   * @param customId The custom id of the text input component
   */
  getTextInputValue(customId: string): string | null {
    return (this._getTypedComponent(customId, [ComponentType.TextInput]) as any)
      .value;
  }

  /**
   * Gets the values of a string select component
   *
   * @param customId The custom id of the string select component
   */
  getStringSelectValues(customId: string): string[] {
    return (
      this._getTypedComponent(customId, [ComponentType.StringSelect]) as any
    ).values;
  }

  /**
   * Gets users component
   *
   * @param customId The custom id of the component
   * @param required Whether to throw an error if the component value is not found or empty
   * The selected users, or null if none were selected and not required
   */
  getSelectedUsers(
    customId: string,
    required = false
  ): Collection<Snowflake, APIUser> | null {
    const component = this._getTypedComponent(
      customId,
      [ComponentType.UserSelect, ComponentType.MentionableSelect],
      ["users"],
      required
    );
    return (component as any).users ?? null;
  }

  /**
   * Gets roles component
   *
   * @param customId The custom id of the component
   * @param required Whether to throw an error if the component value is not found or empty
   */
  getSelectedRoles(
    customId: string,
    required = false
  ): Collection<Snowflake, APIUser> | null {
    const component = this._getTypedComponent(
      customId,
      [ComponentType.RoleSelect, ComponentType.MentionableSelect],
      ["roles"],
      required
    );
    return (component as any).roles ?? null;
  }

  /**
   * Gets channels component
   *
   * @param customId The custom id of the component
   * @param required Whether to throw an error if the component value is not found or empty
   * @param channelTypes allowed types of channels. If empty, all channel types are allowed.
   * @returns The selected channels, or null if none were selected and not required
   */
  getSelectedChannels(
    customId: string,
    required = false,
    channelTypes: ChannelType[] = []
  ): Collection<Snowflake, APIInteractionDataResolvedChannel> {
    const component = this._getTypedComponent(
      customId,
      [ComponentType.ChannelSelect],
      ["channels"],
      required
    );
    const channels = (component as any).channels;
    if (channels && channelTypes.length > 0) {
      for (const channel of channels.values()) {
        if (!channelTypes.includes(channel.type)) {
          throw new DiscordHttpsTypeError(
            DiscordHttpsErrorCodes.ModalSubmitInteractionComponentInvalidChannelType,
            customId,
            channel.type,
            channelTypes.join(", ")
          );
        }
      }
    }

    return channels ?? null;
  }

  /**
   * Gets members component
   *
   * @param customId The custom id of the component
   * @returns The selected members, or null if none were selected or the users were not present in the guild
   */
  getSelectedMembers(
    customId: string
  ): Collection<Snowflake, APIInteractionDataResolvedGuildMember> {
    const component = this._getTypedComponent(
      customId,
      [ComponentType.UserSelect, ComponentType.MentionableSelect],
      ["members"],
      false
    );
    return (component as any).members ?? null;
  }

  /**
   * Gets mentionables component
   *
   * @param customId The custom id of the component
   * @param required Whether to throw an error if the component value is not found or empty
   * @returns The selected mentionables, or null if none were selected and not required
   */
  getSelectedMentionables(
    customId: string,
    required = false
  ): ModalSelectedMentionables | null {
    const component: any = this._getTypedComponent(
      customId,
      [ComponentType.MentionableSelect],
      ["users", "members", "roles"],
      required
    );

    if (component.users || component.members || component.roles) {
      return {
        users: component.users ?? new Collection(),
        members: component.members ?? new Collection(),
        roles: component.roles ?? new Collection(),
      };
    }

    return null;
  }
}
