

const registerHandler = (db,bcrypt) =>{
	const {email,name,password} = req.body;

	if(!email || !name || !password || !token){
		return res.status(400).json('incorrect form submission');
	}

	const hash = bcrypt.hashSync(password);
	db.transaction(trx =>{
		trx.insert({
			hash: hash,
			email:email
		})
		.into('login')
		.returning('email')
		.then(loginEmail =>{
			return trx('users')
			.returning('*')
			.insert({
				email: loginEmail[0],
				name: name,
				joined: new Date()
			})
			.then(user =>{
				res.json(user[0]);
			})
		})
		.then(trx.commit)
		.catch(trx.rollback)

	})
			.catch(err => res.status(400).json('unable to register'))
			//IMPORTANTE no dar datos de la existencia de usuarios
		

}

const insertData = (req,res,db) =>{
	const {message,token,sentido} = req.body;
	console.log(message,token,sentido)
	if(!message || !token || !sentido){
		return res.json({"auth":false});
	}
	db.transaction(trx =>{
		trx.insert({
			data: message,
			token: token,
			sentido: sentido,
		})
		.into('data')
		.then(m =>{
			res.json({"auth":true});
		})
		.then(trx.commit)
		.catch(trx.rollback)
		.catch(err => res.status(400).json('unable to register'))
})
}



module.exports = {
	registerHandler: registerHandler,
	insertData: insertData,
}