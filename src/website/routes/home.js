const router = require('express').Router();
const Shorteners = require('../../models/shortener');
const Discord = require('discord.js');

router.get('/', (req, res) => {
    res.render('home.ejs', {
        _client: req.bot.user,
    });
});

router.get('/redirect/:slug', (req, res) => {
    const { slug } = req.params;
    Shorteners.findOne({ slug: slug }, async (err, response) => {
        if(!response) {
            return res.redirect('/');
        }

        res.redirect(response.link);
    });
});


router.post('/create', (req, res) => {
    const { slug, link } = req.body;
    if(slug.length > 15) return res.render('error.ejs', { error: 'The slug is longer than 15 characters. '})
    Shorteners.findOne({ slug: slug, link: link }, (err, response) => {
        if(!response) {
            let urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/
            let regex = new RegExp(urlRegex);
            if(regex.test(link)) {

                const created = new Discord.MessageEmbed()
                .setTitle('New shortener!')
                .addFields({ name: '🎫 Slug', value: slug }, { name: '📡 Link', value: link }, { name: '📱 Created link', value: `http://localhost:3000/redirect/${slug}` })
                .setColor('#70ff03');
                
                req.bot.channels.cache.get(process.env.CHANNEL).send(created);

                res.render('success.ejs', { success: 'Your shortener has been created.', shortener: true, slug: slug, link: link, PORT: process.env.PORT });
                return Shorteners.create({ slug: slug, link: link });
            } else {
                res.render('error.ejs', { error: 'Not a valid link!' });
            }
        } else {
            res.render('error.ejs', { error: 'This slug is already in use.' });
        }
    });
});

router.get('/delete', (req, res) => {
    res.render('delete.ejs', {
        _client: req.bot.user,
    });
});

router.post('/delete', async (req, res) => {
    const { slug, link } = req.body;
    Shorteners.findOne({ slug: slug, link: link }, async (err, response) => {
        if(response) {

            const created = new Discord.MessageEmbed()
            .setTitle('Deleted shortener!')
            .addFields({ name: '🎫 Slug', value: slug }, { name: '📡 Link', value: link })
            .setColor('#ff0000');
            
            req.bot.channels.cache.get(process.env.CHANNEL).send(created);

            await Shorteners.deleteOne({ slug: slug, link: link });
            return res.render('success.ejs', { success: 'Your shortener has been deleted.', shortener: false });
        } else {
            res.render('error.ejs', { error: 'Impossible to find the data entered.' });
        }
    });
});

module.exports = router;