const dataget = require('./dataget');

const registerHandler = (req,res,db,bcrypt) =>{
	const {email,name,password} = req.body;

	if(!email || !name || !password){
		return res.status(400).json('incorrect form submission');
	}

	const hash = bcrypt.hashSync(password);
	const key = dataget.gen();
	db.transaction(trx =>{
		trx.insert({
			key: key,
			hash: hash,
			email:email,
		})
		.into('login')
		.returning('email')
		.then(loginEmail =>{
			return trx('users')
			.returning('*')
			.insert({
				key: key,
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(user =>{
				console.log("Hola mundo")
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)
		}).catch(err => res.status(400).json('unable to register'))
			//IMPORTANTE no dar datos de la existencia de usuarios
		

}

module.exports = {
	registerHandler: registerHandler
}