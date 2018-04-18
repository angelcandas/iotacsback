const Clarifai = require('clarifai');

const app = new Clarifai.App({
 apiKey: 'f0db8f0f757d4f67b4f8293e5e24e5d2'
});

const handleApiCall =()=> (req,res) => {
	app.models
	.predict(Clarifai.FACE_DETECT_MODEL,req.body.input)
	.then(data =>{
		res.json(data);
	})
	.catch(err => res.status(400).json('Unable to work with clarifai'))
}

const imageHandler = (db) =>(req,res) =>{
	const {id} = req.body;
	db('users').where('id','=',id)
	.increment('entries',1)
	.returning('entries')
	.then(entries =>{
		res.json(entries);
	})
	.catch(err=> 
		res.status(400).json("unable to find entries"))
}

module.exports={
	handleApiCall: handleApiCall,
	imageHandler: imageHandler,
}