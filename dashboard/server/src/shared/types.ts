export interface IGuildSettings {
    guildId: string;
    automod: {
        enabled: boolean;
        antiLink: boolean;
        modRoles: string[];
    };
    music: {
        defaultVolume: number;
        autoPlay: boolean;
        djRole: string | null;
    };
    economy: {
        enabled: boolean;
        startingBalance: number;
    };
    birthday: {
        channelId: string | null;
        message: string;
        roleRewardId: string | null;
    };
}

export interface IUser {
    id: string;
    username: string;
    discriminator: string;
    avatar: string | null;
}

export interface IGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
    hasBot: boolean;
}
