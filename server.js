const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const app = express();
const cors = require('cors');
const knex = require('knex');
//import controllers
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const image = require('./controllers/image');
const profile = require('./controllers/profile');

const db=knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : '3209',
    database : 'smartbrain'
  }
});

/*db.select('*').from('users').then(data =>{
console.log(data)
});*/


app.use(cors()) //IMPORTANTE VERIFICACION CROSS ORIGINS

app.use(bodyParser.json()); // CONTROLADOR DE PARSEO DE JSON

app.get('/',(req,res)=>{}) // RESPUESTA POR DEFECTO DEL SERVIDOR

app.get('/profile/:id',(req,res)=>{profile.profileHandler(req,res,db)})

app.put('/image',image.imageHandler(db))

app.post('/imageurl',image.handleApiCall())

app.post('/signin',(req,res) => {signin.signinHandler(req,res,db,bcrypt)})

app.post('/register',(req,res) => {register.registerHandler(req,res,db,bcrypt)})

app.listen(3000,() =>{console.log("Server running in port 3000")});

/*
/ --> res = this is working
/ signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/