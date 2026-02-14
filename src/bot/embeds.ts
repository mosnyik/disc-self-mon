import { MessageEmbed, GuildMember } from 'discord.js-selfbot-v13';
import { RaidDetectionConfig } from '../types';
import { getAccountAge } from '../utils/helpers';

export function createJoinEmbed(member: GuildMember): MessageEmbed {
  const embed = new MessageEmbed()
    .setColor('#5865F2')
    .setTitle('New Member Detected')
    .setDescription(`**${member.user.tag}** joined **${member.guild.name}**`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  embed.addField('User', member.user.tag, true);
  embed.addField('Account Age', getAccountAge(member.user.createdAt), true);
  embed.addField('Server', member.guild.name, true);

  return embed;
}

export function createRaidEmbed(
  member: GuildMember,
  joinCount: number,
  raidConfig: RaidDetectionConfig
): MessageEmbed {
  const embed = new MessageEmbed()
    .setColor('#FF0000')
    .setTitle('🚨 RAID ALERT')
    .setDescription(`Mass join detected in **${member.guild.name}**`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setTimestamp();

  embed.addField('User', member.user.tag, true);
  embed.addField('Account Age', getAccountAge(member.user.createdAt), true);
  embed.addField('Server', member.guild.name, true);
  embed.addField('Joins Detected', `${joinCount} in ${raidConfig.timeframe}s`, true);
  embed.addField('Member Count', `${member.guild.memberCount}`, true);

  return embed;
}
