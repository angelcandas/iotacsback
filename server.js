const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const https = require('https');
const app = express();
const cors = require('cors');
const knex = require('knex');
//import controllers
const dataget = require('./controllers/dataget');
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const image = require('./controllers/image');
const profile = require('./controllers/profile');
const insert =  require('./controllers/insert');
const mosca = require('mosca');
const { Client } = require('pg');
/*
const client = new Client({
    user: 'postgres',
    host: process.env.DATABASE_URL || '127.0.0.1',
    database: 'smartbrain',
    password: '3209',
    port: 5432,
});

client.connect();

const db=knex({
  client: 'pg',
  connection:{
    user: 'postgres',
    host: process.env.DATABASE_URL || '127.0.0.1',
    database: 'smartbrain',
    password: '3209',
    port: 5432,
  }
});
*/

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

client.connect();
const db=knex({
  client: 'pg',
  connection:{
    connectionString: process.env.DATABASE_URL || '127.0.0.1',
    ssl: true
  }
});

/*db.select('*').from('users').then(data =>{
console.log(data)
});*/






app.use(cors()) //IMPORTANTE VERIFICACION CROSS ORIGINS

app.use(bodyParser.json()); // CONTROLADOR DE PARSEO DE JSON

app.get('/',(req,res)=>{res.status(200).json("Everything works fine!")}) // RESPUESTA POR DEFECTO DEL SERVIDOR

app.get('/profile/:id',(req,res)=>{profile.profileHandler(req,res,db)})

app.post('/token',(req,res)=>{dataget.tokenGen(req,res,db)})

app.delete('/token',(req,res)=>{dataget.tokenDel(req,res,db)})

app.get('/:token',(req,res)=>{dataget.datagetHandler(req,res,db)})

app.post('/tokendat',(req,res)=>{dataget.datadevice(req,res,db)})

app.put('/:token',(req,res)=>{dataget.dataUpdate(req,res,db)})

app.get('/tokens/:user',(req,res)=>{dataget.tokensHandler(req,res,db)})

app.put('/image',image.imageHandler(db))

app.post('/imageurl',image.handleApiCall())

app.post('/signin',(req,res) => {signin.signinHandler(req,res,db,bcrypt)})

app.post('/register',(req,res) => {register.registerHandler(req,res,db,bcrypt)})

app.get('/*',(req,res)=>{res.status(404).json("File Not Found!")})


/*A PARTIR DE AQUI SE ENCONTRARA EL CODIGO DE LA PARTE PUBLISHER SUBSCRIBER DEL PROYECTO
*/


var settings = {
  port: process.env.PORT || 1883,
};
 

// Accepts the connection if the username and password are valid
var authenticate = function(client, username, password, callback) {
  //console.log("TOKEN: "+client.key)
  //console.log("USER: "+username);
    password=password.toString();
    // statements

  //console.log("PASS: "+password);
  db.select('email','hash','key').from('login')
  .where('email','=',username)
  .then(data =>{
    //console.log(data[0])
    const isValid= bcrypt.compareSync(password,data[0].hash)
    const keyok= (data[0].key==password) 
    if (isValid || keyok){ 
      client.user = username;
      console.log(client.id+": authorized!")
      callback(null, isValid||keyok);
    }else{
      callback(null,false);
    }
    })
  .catch(err => {
    console.log(client.id+": Wrong credentials")})

}

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function(client, topic, payload, callback) {
  payload=JSON.parse(payload);
  message=payload.message;
  token=payload.token;
  ertopic=topic.split('/');
  db.select('token').from('tokens').where('email','=',client.user)
    .then(data=>{
        var test=0;
        data.forEach(dato =>{
          if(token===dato.token){
            callback(null,token===dato.token);
            test++;
          }
        })
        if(test==0){
          console.log(client.id+": Invalid token, message rejected");
          callback(null,0);
          return 0;
        }
  })
  
}

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function(client, topic, callback) {
  callback(null, true);
}

//Starting mosca over express

let broker = new mosca.Server({});
let server = https.createServer(app);
broker.attachHttpServer(server);
broker.listen(app)
//here we start mosca
/*
httpServ = http.createServer()
var server = new mosca.Server(settings);
server.attachHttpServer(httpServ);
httpServ.listen(process.env.MQTT_WS_PORT || 5200);
console.log("Web socket: "+process.env.MQTT_WS_PORT)
console.log("Mosca socket: "+process.env.MQTT_PORT)
*/
server.on('ready', ()=>{
  server.authenticate = authenticate;
  server.authorizePublish = authorizePublish;
  server.authorizeSubscribe = authorizeSubscribe;
  console.log('Mosca server is up and running')

});

// fired when the mqtt server is ready
 
// fired whena  client is connected
server.on('connection', function(client) {
  console.log('client connected', client.id);
});
 
// fired when a message is received
server.on('published', function(packet,client) {
    if(client!=null){
    try{payload=JSON.parse(packet.payload);
      let sentido='action';
      message=payload.message;
      token=payload.token;
      sentido=payload.direction;
      db.transaction(trx =>{
      trx.insert({
        data: message,
        token:token,
        sentido: sentido,
      })
      .into('data')
      .returning('token')
      .then( token =>{
        console.log('Client : ', token);  
      }
      )
      .then(trx.commit)
      .catch(trx.rollback)
      });}
      catch(e){
        console.log(e)
      }
    }
  });
 
// fired when a client subscribes to a topic
server.on('subscribed', function(topic, client) {
  console.log('subscribed : ', topic);
});
 
// fired when a client subscribes to a topic
server.on('unsubscribed', function(topic, client) {
  //console.log('unsubscribed : ', topic);
});
 
// fired when a client is disconnecting
server.on('clientDisconnecting', function(client) {
  //console.log('clientDisconnecting : ', client.id);
});
 
// fired when a client is disconnected
server.on('clientDisconnected', function(client) {
  //console.log('clientDisconnected : ', client.id);
});




app.listen(process.env.PORT || 3000,() =>{
  console.log("Server running in port " + process.env.PORT);
});





/*----FIN PUBLISHER SUBSCRIBER----*/
/*
/ --> res = this is working
/ signin --> POST = success/fail
/register --> POST = user
/profile/:userId --> GET = user
/image --> PUT --> user
*/