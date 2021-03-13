require('dotenv').config();
const Client = require('./src/client/index');
new Client().start(process.env.TOKEN, './src/handlers/commands', './src/handlers/events');