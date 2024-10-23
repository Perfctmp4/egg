// Import required modules 
const { Client, GatewayIntentBits, Events, REST, Routes } = require('discord.js');

// Create a new Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Use your actual Token and IDs here
const TOKEN = 'MTI5ODM1Mzk1MTAzMjIxMzUzNA.GKLHZl.gme7gWgS5Ge6MzWBuT6jaKCm0BDE3IJfCAYYts';  // Your bot token
const CLIENT_ID = '1298353951032213534';  // Your client ID
const GUILD_ID = '1297896130771947565';  // Your guild ID

// Store all invites
let invites = new Map();

// Rank system based on invites
const rankLevels = [
    { level: 1, invites: 5, role: 'Starter' },
    { level: 2, invites: 10, role: 'Advanced' },
    { level: 3, invites: 25, role: 'Supporter' },
    { level: 4, invites: 40, role: 'Top Supporter' }
];

// Initialize the warning system
const warnings = new Map();

// List of bad words
const badWords = ['Hund', 'Hurensohn', 'Hurentochter', 'HS', 'Nazi', 'Hitler'];

// Premium feature tracking
const userActivity = new Map(); // For tracking user activity
const customCommands = new Map(); // For storing custom commands

// Register all commands
const commands = [
    // Invitation commands
    { name: 'invite', description: 'Generates an invite link for the server.' },
    {
        name: 'invites',
        description: 'Displays the number of invites for a user',
        options: [
            {
                name: 'user',
                description: 'The user to check',
                type: 6, // USER
                required: false
            }
        ]
    },
    {
        name: 'stats',
        description: 'Displays how many invites are needed for the next level'
    },
    // New command for invite system
    {
        name: 'invsystem',
        description: 'Displays the invite system and rank levels.'
    },
    // Rank commands
    {
        name: 'rank',
        description: 'Displays your current rank and invites count'
    },
    {
        name: 'checkrank',
        description: 'Check another user\'s rank',
        options: [
            {
                name: 'user',
                description: 'The user to check',
                type: 6, // USER
                required: true
            }
        ]
    },

    // Welcome command
    {
        name: 'greet',
        description: 'Sends a custom welcome message to a new member',
        options: [
            {
                name: 'user',
                description: 'The member to greet',
                type: 6, // USER
                required: true
            }
        ]
    },

    // Warning system
    {
        name: 'warn',
        description: 'Warns a user and tracks their warnings',
        options: [
            {
                name: 'user',
                description: 'The user to warn',
                type: 6, // USER
                required: true
            },
            {
                name: 'reason',
                description: 'The reason for the warning',
                type: 3, // STRING
                required: false
            }
        ]
    },
    {
        name: 'warnings',
        description: 'Displays the number of warnings for a user',
        options: [
            {
                name: 'user',
                description: 'The user to check',
                type: 6, // USER
                required: true
            }
        ]
    },

    // Role assignment
    {
        name: 'role',
        description: 'Assign a game role: Fortnite, Rocket League, Rainbow, Valorant',
        options: [
            {
                name: 'game',
                description: 'The game role to assign',
                type: 3, // STRING
                required: true,
                choices: [
                    { name: 'Fortnite', value: 'fortnite' },
                    { name: 'Rocket League', value: 'rocketLeague' },
                    { name: 'Rainbow', value: 'rainbow' },
                    { name: 'Valorant', value: 'valorant' }
                ]
            },
            {
                name: 'delet',
                description: 'Remove existing game roles before assigning a new one',
                type: 5, // BOOLEAN
                required: false
            }
        ]
    },

    // Premium features
    {
        name: 'customcommand',
        description: 'Create or update a custom command',
        options: [
            {
                name: 'name',
                description: 'The name of the command',
                type: 3, // STRING
                required: true
            },
            {
                name: 'response',
                description: 'The response for the command',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'runcommand',
        description: 'Run a custom command',
        options: [
            {
                name: 'name',
                description: 'The name of the command to run',
                type: 3, // STRING
                required: true
            }
        ]
    },
    {
        name: 'activity',
        description: 'Set your activity status',
        options: [
            {
                name: 'status',
                description: 'Your new activity status',
                type: 3, // STRING
                required: true
            }
        ]
    }
];

// Command handling logic
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member } = interaction;

    switch (commandName) {
        // Invitation commands
        case 'invite':
            const inviteLink = await interaction.guild.invites.create(interaction.channel, { maxAge: 0, maxUses: 0 });
            // Send a DM to the user with the invite link
            try {
                await member.send(`This is your link: ${inviteLink}`);
                await interaction.reply('I have sent you a DM with your invite link!');
            } catch (error) {
                console.error('Error sending DM:', error);
                await interaction.reply('I could not send you a DM. Please check your privacy settings.');
            }
            break;

        case 'invites':
            const user = options.getUser('user') || member.user;
            const inviteCount = invites.get(user.id) || 0;
            await interaction.reply(`${user.username} has ${inviteCount} invites.`);
            break;

        case 'stats':
            const currentInvites = invites.get(member.user.id) || 0;
            const nextLevel = rankLevels.find(level => level.invites > currentInvites);
            const invitesNeeded = nextLevel ? nextLevel.invites - currentInvites : 0;

            await interaction.reply(`You need ${invitesNeeded} more invites to reach the next level!`);
            break;

        // New Invsystem command
        case 'invsystem':
            const invSystemMessage = `
─────────⋆.˚⟡ ࣪ ˖─────────
ᯓ★Level 1 = 5 invites
╰┈➤@Starter── .✦
──────────୨ৎ──────────
ᯓ★Level 2 = 10 invites
╰┈➤@Advanced── .✦
──────────୨ৎ──────────
ᯓ★Level 3 = 25 invites
╰┈➤@Supporter── .✦
──────────୨ৎ──────────
ᯓ★Level 4 = 40 invites
╰➤@Top Supporter── .✦
─────────⋆.˚⟡ ࣪ ˖─────────
            `;
            // Send the invite system message as a DM
            try {
                await member.send(invSystemMessage);
                await interaction.reply('I have sent you the invite system details in a DM!');
            } catch (error) {
                console.error('Error sending DM:', error);
                await interaction.reply('I could not send you a DM. Please check your privacy settings.');
            }
            break;

        // Rank commands
        case 'rank':
            const currentRankInvites = invites.get(member.user.id) || 0;
            const userRank = rankLevels.find(rank => currentRankInvites >= rank.invites);
            await interaction.reply(`You are currently at rank ${userRank ? userRank.role : 'no rank'} with ${currentRankInvites} invites.`);
            break;

        case 'checkrank':
            const targetUser = options.getUser('user');
            const targetInvites = invites.get(targetUser.id) || 0;
            const targetRank = rankLevels.find(rank => targetInvites >= rank.invites);
            await interaction.reply(`${targetUser.username} is currently at rank ${targetRank ? targetRank.role : 'no rank'} with ${targetInvites} invites.`);
            break;

        // Greeting command
        case 'greet':
            const greetUser = options.getUser('user');
            await interaction.reply(`Welcome, ${greetUser.username}! We're glad to have you here!`);
            break;

        // Warning commands
        case 'warn':
            const warnedUser = options.getUser('user');
            const reason = options.getString('reason') || 'No reason provided';
            const userWarnings = warnings.get(warnedUser.id) || [];
            userWarnings.push(reason);
            warnings.set(warnedUser.id, userWarnings);
            await interaction.reply(`Warned ${warnedUser.username} for: ${reason}`);
            break;

        case 'warnings':
            const targetUserWarnings = warnings.get(options.getUser('user').id) || [];
            await interaction.reply(`${options.getUser('user').username} has the following warnings: ${targetUserWarnings.join(', ') || 'No warnings'}`);
            break;

        // Role assignment
        case 'role':
            const gameRole = options.getString('game');
            const delet = options.getBoolean('delet');

            if (delet) {
                const rolesToRemove = ['Fortnite', 'Rocket League', 'Rainbow', 'Valorant'];
                rolesToRemove.forEach(async (roleName) => {
                    const role = interaction.guild.roles.cache.find(r => r.name === roleName);
                    if (role) {
                        await member.roles.remove(role);
                        console.log(`Removed role ${roleName} from ${member.user.username}.`);
                    }
                });
            }

            const roleToAssign = interaction.guild.roles.cache.find(r => r.name === gameRole);
            if (roleToAssign) {
                await member.roles.add(roleToAssign);
                await interaction.reply(`Assigned role ${gameRole} to you!`);
            } else {
                await interaction.reply(`Role ${gameRole} does not exist!`);
            }
            break;

        // Custom commands
        case 'customcommand':
            const commandName = options.getString('name');
            const commandResponse = options.getString('response');
            customCommands.set(commandName, commandResponse);
            await interaction.reply(`Custom command "${commandName}" has been created.`);
            break;

        case 'runcommand':
            const runCommand = options.getString('name');
            const commandResponseText = customCommands.get(runCommand);
            await interaction.reply(commandResponseText ? commandResponseText : `Command "${runCommand}" does not exist.`);
            break;

        case 'activity':
            const status = options.getString('status');
            userActivity.set(member.user.id, status);
            await interaction.reply(`Your activity status has been set to "${status}".`);
            break;
    }
});

// Handle member join to check invites
client.on(Events.GuildMemberAdd, async (member) => {
    // Fetch invites for the guild
    const guildInvites = await member.guild.invites.fetch();
    const userInvites = invites.get(member.id) || 0;

    guildInvites.forEach((invite) => {
        if (invite.inviter && invite.inviter.id === member.id) {
            invites.set(member.id, userInvites + invite.uses);
            assignRole(member, invites.get(member.id)); // Check for role assignment
        }
    });
});

// Function to assign roles based on invites
async function assignRole(member, inviteCount) {
    const roleToAssign = rankLevels.find(rank => inviteCount >= rank.invites)?.role;
    const role = member.guild.roles.cache.find(r => r.name === roleToAssign);
    
    if (role) {
        await member.roles.add(role);
        console.log(`Assigned role ${roleToAssign} to ${member.user.username}!`);
    }
}

// Log in to Discord
client.login(TOKEN);

// Register commands with Discord
async function registerCommands() {
    const rest = new REST({ version: '9' }).setToken(TOKEN);
    try {
        console.log('Starting command registration...');
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
        console.log('Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering slash commands:', error);
    }
}

// Call the registerCommands function to register the commands
registerCommands();

client.once(Events.ClientReady, () => {
    console.log(`Logged in as ${client.user.tag}`);
});