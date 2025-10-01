import { Attachment } from "../Attachment/Attachment.js";
import { Collection } from "@discordjs/collection";

import type {
  APIUser,
  APIRole,
  APIMessage,
  APIAttachment,
  APIInteractionDataResolved,
  APIInteractionDataResolvedChannel,
  APIInteractionDataResolvedGuildMember,
  APIMessageApplicationCommandInteractionDataResolved,
  APIMessageComponent,
} from "discord-api-types/v10";

import { ComponentType } from "discord-api-types/v10";
import type * as djs from "discord.js";

const isObject = (data: any) => typeof data === "object" && data !== null;

/**
 * Flatten an object. Any properties that are collections will get converted to an array of keys.
 *
 * @param obj The object to flatten.
 * @param props specific properties to include/exclude.
 * @returns
 */

export function flatten(
  obj: Record<string, any>,
  ...props: Record<string, boolean | string>[]
) {
  if (!isObject(obj)) return obj;

  const objProps = Object.keys(obj)
    .filter((key) => !key.startsWith("_"))
    .map((key) => ({ [key]: true }));

  const mergedProps = objProps.length
    ? Object.assign({}, ...objProps, ...props)
    : Object.assign({}, ...props);

  const out: any = {};

  // eslint-disable-next-line prefer-const
  for (let [prop, rawNewProp] of Object.entries(mergedProps)) {
    if (!rawNewProp) continue;
    const newProp: any = rawNewProp === true ? prop : rawNewProp;
    const element = obj[prop];
    const elemIsObj = isObject(element);
    const valueOf =
      elemIsObj && typeof element.valueOf === "function"
        ? element.valueOf()
        : null;
    const hasToJSON = elemIsObj && typeof element.toJSON === "function";

    // If it's a Collection, make the array of keys
    if (element instanceof Collection)
      out[newProp] = Array.from(element.keys());
    // If the valueOf is a Collection, use its array of keys
    else if (valueOf instanceof Collection)
      out[newProp] = Array.from(valueOf.keys());
    // If it's an array, call toJSON function on each element if present, otherwise flatten each element
    else if (Array.isArray(element))
      out[newProp] = element.map((elm) => elm.toJSON?.() ?? flatten(elm));
    // If it's an object with a primitive `valueOf`, use that value
    else if (typeof valueOf !== "object") out[newProp] = valueOf;
    // If it's an object with a toJSON function, use the return value of it
    else if (hasToJSON) out[newProp] = element.toJSON();
    // If element is an object, use the flattened version of it
    else if (typeof element === "object") out[newProp] = flatten(element);
    // If it's a primitive
    else if (!elemIsObj) out[newProp] = element;
  }

  return out;
}

/**
 * Verifies the provided data is a string, otherwise throws the provided error.
 *
 */
export function verifyString(
  data: string,
  error: new (...a: any[]) => Error,
  errorMessage = `Expected a string, got ${data} instead.`,
  allowEmpty = true
) {
  if (typeof data !== "string") throw new error(errorMessage);
  if (!allowEmpty && data.length === 0) throw new error(errorMessage);
  return data;
}

/**
 * Parses emoji info out of a string. The string must be one of:
 * - A UTF-8 emoji (no id)
 * - A URL-encoded UTF-8 emoji (no id)
 * - A Discord custom emoji (`<:name:id>` or `<a:name:id>`)
 *
 */
export function parseEmoji(text: string): djs.PartialEmoji | null {
  const decodedText = text.includes("%") ? decodeURIComponent(text) : text;
  if (!decodedText.includes(":"))
    return { animated: false, name: decodedText, id: undefined };
  const match =
    /<?(?:(?<animated>a):)?(?<name>\w{2,32}):(?<id>\d{17,19})?>?/.exec(
      decodedText
    );
  return (
    match && {
      // @ts-ignore
      animated: Boolean(match.groups.animated),
      // @ts-ignore
      name: match.groups.name,
      // @ts-ignore
      id: match.groups.id,
    }
  );
}
/**
 * Resolves a partial emoji object from an EmojiIdentifierResolvable, without checking a Client.
 *
 */
export function resolvePartialEmoji(
  emoji: djs.Emoji | djs.EmojiIdentifierResolvable
): null | djs.PartialEmoji | djs.PartialEmojiOnlyId {
  if (!emoji) return null;
  if (typeof emoji === "string")
    return /^\d{17,19}$/.test(emoji) ? { id: emoji } : parseEmoji(emoji);
  const { id, name, animated } = emoji;
  if (!id && !name) return null;
  // @ts-ignore
  return { id, name, animated: Boolean(animated) };
}

export function basename(pathOrUrl: string): string {
  if (!pathOrUrl) return "";
  // Find last slash or backslash
  const i = Math.max(pathOrUrl.lastIndexOf("/"), pathOrUrl.lastIndexOf("\\"));
  return i === -1 ? pathOrUrl : pathOrUrl.slice(i + 1);
}

type APIInteractionResolvedEntity =
  | APIUser
  | APIRole
  | APIInteractionDataResolvedGuildMember
  | APIInteractionDataResolvedChannel
  | APIAttachment;

type CommandInteractionResolvedData_ = Record<
  string,
  Collection<string, APIInteractionResolvedEntity>
>;

export interface InteractionResolvedData {
  members?: Collection<string, APIInteractionDataResolvedGuildMember>;
  users?: Collection<string, APIUser>;
  roles?: Collection<string, APIRole>;
  channels?: Collection<string, APIInteractionDataResolvedChannel>;
  messages?: Collection<string, APIMessage>;
  attachments?: Collection<string, Attachment>;
}

export type ResolvedData = APIInteractionDataResolved &
  Partial<
    Pick<APIMessageApplicationCommandInteractionDataResolved, "messages">
  >;

/**
 * @internal
 * Transforms the resolved data received from the API.
 */

export function transformResolved({
  members,
  users,
  channels,
  roles,
  messages,
  attachments,
}: ResolvedData | undefined = {}): InteractionResolvedData {
  const result = {} as InteractionResolvedData;

  if (members) {
    result.members = new Collection();
    for (const [id, member] of Object.entries(members)) {
      const user = users?.[id];
      result.members.set(id, member);
    }
  }

  if (users) {
    result.users = new Collection();
    for (const user of Object.values(users)) {
      result.users.set(user.id, user);
    }
  }

  if (roles) {
    result.roles = new Collection();
    for (const role of Object.values(roles)) {
      result.roles.set(role.id, role);
    }
  }

  if (channels) {
    result.channels = new Collection();
    for (const apiChannel of Object.values(channels)) {
      result.channels.set(apiChannel.id, apiChannel);
    }
  }

  if (messages) {
    result.messages = new Collection();
    for (const message of Object.values(messages)) {
      result.messages.set(message.id, message);
    }
  }

  if (attachments) {
    result.attachments = new Collection();
    for (const attachment of Object.values(attachments)) {
      const patched = new Attachment(attachment);
      result.attachments.set(attachment.id, patched);
    }
  }

  return result;
}

export function extractInteractiveComponents(
  //maybe should i just mark this one as any?
  component: APIMessageComponent | djs.Component
): Array<djs.Component | APIMessageComponent> {
  switch (component.type) {
    case ComponentType.ActionRow:
      return (component as any).components;
    case ComponentType.Section:
      return [...(component as any).components, (component as any).accessory];
    case ComponentType.Container:
      return (component as any).components.flatMap(
        extractInteractiveComponents
      );
    default:
      return [component];
  }
}

/**
 * @internal
 * Finds a component by customId in nested components
 */
export function findComponentByCustomId(
  components: Array<djs.Component | APIMessageComponent>,
  customId: string
): APIMessageComponent | djs.Component | null {
  return (
    components
      .flatMap(extractInteractiveComponents)
      .find(
        (component) =>
          ((component as any).customId ?? (component as any).custom_id) ===
          customId
      ) ?? null
  );
}

export function getInstanceName(value: any) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value !== "object") return typeof value; // string, number, boolean, etc.
  return value.constructor?.name || "Unknown Object"; // fallback for objects without a constructor
}
