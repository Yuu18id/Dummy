import express from 'express'
import { sequelize } from './models/model.js';
import Novel from './models/novel.js'
import user_controller from './controllers/user.js'
import session from 'express-session';
import User from './models/user.js';

const app = express();
const hostname = '127.0.0.1';
const port = 3001;

app.use(express.json());
app.use(express.urlencoded());
app.set('view engine', 'ejs');

app.use(express.static('views'))

app.use(session({
    secret: 'ini adalah kode secret###',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 } // 1 hour
}));

sequelize.authenticate()
Novel.sync()
User.sync()


app.get("/login", user_controller.login);
app.get("/logout", user_controller.logout);
app.post("/login", user_controller.auth);


app.get('/', (req, res) => {
    Novel.findAll().then((results) => {
        res.render('index', { novel: results, user: req.session.user || "" });
    });
})

app.get('/create', (req, res) => {
    res.render('create', { user: req.session.user });
})

app.get('/edit/:id', (req, res) => {
    Novel.findOne({ where: { id: req.params.id } }
    ).then((results) => {
        res.render('edit', { novel: results, user: req.session.user });
    })
})

app.post('/novel', (req, res) => {
    Novel.create({
        judul: req.body.judul,
        author: req.body.author,
        genre: req.body.genre,
        sinopsis: req.body.sinopsis,
        createdBy: req.session.user.username
    }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
})

app.put('/novel/:id', (req, res) => {
    Novel.update({
        judul: req.body.judul,
        author: req.body.author,
        genre: req.body.genre,
        sinopsis: req.body.sinopsis,
        createdBy: req.session.user.username
    }, { where: { id: req.params.id } }
    ).then((results) => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 502, error: err });
    })
})

app.delete('/novel/:id', (req, res) => {
    Novel.destroy({ where: { id: req.params.id } }
    ).then(() => {
        res.json({ status: 200, error: null, Response: results });
    }).catch(err => {
        res.json({ status: 500, error: err, Response: {} });
    })
})

app.listen(port, () => {
    console.log(`Server running at ${hostname}:${port}`);
})