const jwt = require('./jwt')
const signinHandler= (req,res,db,bcrypt) =>{
	const {email, password} = req.body;
	if(!email || !password){
		return res.status(400).json('incorrect form submission');
	}
	db.select('email','hash').from('login')
	.where('email','=',email)
	.then(data =>{
		const isValid= bcrypt.compareSync(password,data[0].hash)
		if(isValid){
			return db.select('*').from('users')
			.where('email','=',email)
			.then(user =>{
				res.status(200).json({
						user: user,
						token: jwt.createToken(user)
					})
			})
			.catch(err => res.status(400).json('unable to get user'))
		}else{
			return res.status(404).json('Wrong credentials')
		}
	})
	.catch(err => res.status(400).json('Wrong credentials'))
}

module.exports={
	signinHandler: signinHandler
}