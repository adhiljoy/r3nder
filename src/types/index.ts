import { ChatInputCommandInteraction } from "discord.js";
import { R3NDERClient } from "@client/R3nderClient";

export interface Command {
    data: any;
    execute: (client: R3NDERClient, interaction: ChatInputCommandInteraction) => Promise<void>;
}
