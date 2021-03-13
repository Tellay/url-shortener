const { log, error } = require('console');
const { Client, Collection } = require('discord.js');

class client extends Client {
    constructor() {
        super();
        this.commands = new Collection();
        this.discord = require('discord.js');
        this.ms = require('ms');
        this.moment = require('moment');
        this.fs = require('fs');
        this.numeral = require('numeral');
        this.fetch = require('node-fetch');
        this.mongoose = require('mongoose');
        this.owner = process.env.OWNER;
        this.dashboard = require('../website/dashboard');
    }

    commandHandler(path) {
        this.fs.readdir(path, (err, files) => {
            if(!files) return;
            files.filter(file => file.split('.').pop() === 'js');
            files.forEach((file, error) => {
                try {
                    const props = require(`../handlers/commands/${file}`);
                    this.commands.set(props.name, props);
                } catch (err) {
                    return console.log(error);;
                }
            });
        });
    }

    eventHandler(path) {
        this.fs.readdir(path, (err, files) => {
            if(!files) return;
            files.filter(file => file.split('.').pop() === 'js');
            files.forEach((file, error) => {
                console.log(file);
                try {
                    const props = require(`../handlers/events/${file}`);
                    this.on(file.split(".")[0], (...args) => props.run(client, ...args))
                } catch (err) {
                    return console.log(error);;
                }
            });
        });
    }
    
    runDatabase(uri) {
        this.mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
            (error) => error
            ? console.log(error)
            : console.log(`Connected to database with sucess!`)
        )
    }

    getCommand(cmd) {
        return this.commands.has(cmd) ? this.commands.get(cmd) : false;
    }


    start(token, cmdPath, eventPath) {
        this.commandHandler(cmdPath);
        this.eventHandler(eventPath);
        this.dashboard.load(this);
        this.login(token);
        this.runDatabase(process.env.MONGO_URI);
        this.on('ready', () => {
            this.user.setPresence({ status: "dnd" });
            console.log(`Client is now ready on ${this.user.tag} account.`);
        });

        this.prefix = process.env.PREFIX;
        this.on('message', (message) => {
            if(message.author.bot || !message.content.startsWith(this.prefix) || message.channel.type === 'dm') return;
            const [cmd, ...args] = message.content.slice(this.prefix.length).trim().split(/ +/g);
            const command = this.getCommand(cmd);
            if(command) return command.run(this, message, args).catch(console.log(error));
        });
    }
}

module.exports = client;