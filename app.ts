import * as Discord from 'discord.js';
import config from 'config';

import { formatDate } from './src/helpers/date-formater.helper';

import { bossStatusWatcherService } from './src/services/boss-status-watcher.service';
import { bossStatusStoreService } from './src/services/boss-status-store.service';
import { constantWindowService } from './src/services/constant-window.service';

const client = new Discord.Client();
client.login(config.get('discord.token'));

client.on('ready', async () => {
    console.log(`Online --- ${formatDate(new Date())}`);

    bossStatusStoreService.watchBosses();
    constantWindowService.init(client);
    bossStatusWatcherService.init(client);
});
