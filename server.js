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

const { Client } = require('pg');

const client = new Client({
	connectionString: process.env.DATABASE_URL,
	ssl: true,
});

client.connect();

const db=knex({
  client: 'pg',
  connection: {
 	connectionString: process.env.DATABASE_URL,
	ssl: true,
  }
});

/*db.select('*').from('users').then(data =>{
console.log(data)
});*/


app.use(cors()) //IMPORTANTE VERIFICACION CROSS ORIGINS

app.use(bodyParser.json()); // CONTROLADOR DE PARSEO DE JSON

app.get('/',(req,res)=>{res.status(200).json("Everything works fine!")}) // RESPUESTA POR DEFECTO DEL SERVIDOR

app.get('/profile/:id',(req,res)=>{profile.profileHandler(req,res,db)})

app.put('/image',image.imageHandler(db))

app.post('/imageurl',image.handleApiCall())

app.post('/signin',(req,res) => {signin.signinHandler(req,res,db,bcrypt)})

app.post('/register',(req,res) => {register.registerHandler(req,res,db,bcrypt)})

app.listen(process.env.PORT || 3000,() =>{
	console.log(`Server running in port ${process.env.PORT}`);
});

/*
/ --> res = this is working
/ signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/