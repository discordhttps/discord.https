import { Collection } from "@discordjs/collection";
import { lazy } from "@discordjs/util";
import { transformResolved } from "../../utils/Util.js";
import { BaseInteraction } from "../BaseInterction.js";

import { InteractionWebhook } from "../../InteractionWebhook.js";
import {
  ExtendedInteractionResponseMixin,
  AttachShowModalMethod,
} from "../InteractionReponseMixin.js";
import type {
  APIModalSubmitInteraction,
  APIInteractionDataResolved,
  APIMessage,
} from "discord-api-types/v10";
import type { HttpAdapterSererResponse } from "../../../adapter/index.js";

import type {
  APIUser,
  APIGuildMember,
  APIRole,
  APIInteractionDataResolvedGuildMember,
  APIUserInteractionDataResolved,
  APIActionRowComponent,
  APILabelComponent,
  Snowflake,
  APITextDisplayComponent,
  APIInteractionDataResolvedChannel,
} from "discord-api-types/v10";

import {
  ModalComponentResolver,
  ActionRowModalData,
  BaseModalData,
  LabelModalData,
  ModalData,
  ModalSelectedMentionables,
  SelectMenuModalData,
  TextDisplayModalData,
  TextInputModalData,
} from "./ModalComponentResolver.js";

import Client from "../../../index.js";

/**
 * Represents a modal interaction
 */
export class ModalSubmitInteraction extends ExtendedInteractionResponseMixin(
  BaseInteraction
) {
  /**
   * The custom id of the modal.
   */
  public customId: string;
  /**
   * The message associated with this interaction
   */
  public message: APIMessage | null;
  /**
   * The components within the modal
   */
  public components: ModalComponentResolver;
  /**
   * Whether the reply to this interaction has been deferred
   */
  public deferred: boolean = false;
  /**
   * Whether this interaction has already been replied to
   */
  public replied: boolean = false;
  /**
   * Whether the reply to this interaction is ephemeral
   */
  public ephemeral: boolean | null = null;
  /**
   * An associated interaction webhook, can be used to further interact with this interaction
   */
  public webhook: InteractionWebhook;

  constructor(
    readonly client: Client,
    data: APIModalSubmitInteraction,
    /** @internal */
    readonly res: HttpAdapterSererResponse
  ) {
    super(client, data);
    this.customId = data.data.custom_id;
    this.message = data.message ?? null;
    this.components = new ModalComponentResolver(
      this.client,
      data.data.components?.map((component) =>
        this.transformComponent(component, data.data.resolved)
      ) as any,
      data.data.resolved
    );

    this.deferred = false;
    this.replied = false;
    this.ephemeral = null;
    this.webhook = new InteractionWebhook(
      this.client,
      this.applicationId,
      this.token
    );
  }

  private transformComponent(
    rawComponent: any,
    resolved?: APIInteractionDataResolved
  ): ModalData {
    if ("components" in rawComponent) {
      return {
        type: rawComponent.type,
        id: rawComponent.id,
        components: rawComponent.components.map((component: any) =>
          this.transformComponent(component, resolved)
        ) as any,
      } as any;
    }

    if ("component" in rawComponent) {
      return {
        type: rawComponent.type,
        id: rawComponent.id,
        component: this.transformComponent(
          rawComponent.component,
          resolved
        ) as any,
      } as any;
    }

    const data: any = { type: rawComponent.type, id: rawComponent.id };

    // Text display components do not have custom ids.
    if ("custom_id" in rawComponent) data.customId = rawComponent.custom_id;
    if ("value" in rawComponent) data.value = rawComponent.value;

    if (rawComponent.values) {
      data.values = rawComponent.values;
      if (resolved) {
        // The result of the code below's below seems to match `transformResolved`,
        // except that only entries with a value are added to `data`.
        let result = transformResolved(resolved);
        for (const [key, value] of Object.entries(result)) {
          if (value.size) {
            data[key] = value;
          }
        }

        //     const resolveCollection = <T>(resolvedData: Record<string, T>) => {
        //       const collection = new Collection<string, T>();
        //       for (const value of data.values) {
        //         if (resolvedData?.[value])
        //           collection.set(value, resolvedData[value]);
        //       }
        //       return collection.size ? collection : null;
        //     };

        //     const users = resolveCollection(resolved.users);
        //     if (users) data.users = users;

        //     const channels = resolveCollection(
        //       resolved.channels,
        //       (channel) => this.client.channels._add(channel, this.guild) ?? channel
        //     );
        //     if (channels) data.channels = channels;

        //     const members = resolveCollection(
        //       resolved.members,
        //       (member) => this.guild?.members._add(member) ?? member
        //     );
        //     if (members) data.members = members;

        //     const roles = resolveCollection(
        //       resolved.roles,
        //       (role) => this.guild?.roles._add(role) ?? role
        //     );
        //     if (roles) data.roles = roles;
        //   }
        // }
      }
    }
    return data;
  }

  public isFromMessage(): boolean {
    return Boolean(this.message);
  }
}
