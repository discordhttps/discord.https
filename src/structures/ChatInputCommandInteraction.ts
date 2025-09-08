import Base, { type DiscordHttpsAPIInteraction } from "./BaseInterction.js";
import { REST } from "@discordjs/rest";
class ChatInputCommandInteraction extends Base {
  constructor(client: REST, data: DiscordHttpsAPIInteraction) {
    super(client, data);
  }
}
export default ChatInputCommandInteraction;
