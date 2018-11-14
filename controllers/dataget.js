
const dataget= (req,res,db) =>{
	const {token} = req.params;
	if(!token){
		return res.status(400).json('incorrect form submission');
	}
	else{
		db.select(['data','ts']).from('data')
		.where('token','=',token).andWhere('sentido','=','pub')
		.orderBy('ts', 'desc')
		.limit(50)
		.then(data =>{
			res.json(data.reverse())
		})
		.catch(err => {
			console.log(err)
			res.status(400).json('Wrong credentials')
			})
	}
}
const dataget_last= (req,res,db) =>{
	const {token2} = req.params;
	console.log(token2)
	if(!token2){
		return res.status(400).json('incorrect form submission');
	}
	else{
		db.select('*').from('tokens').join('data',function(){this.on('tokens.token','=','data.token').orOn('tokens.token','=','data.token')})
		.where('sentido','pub').where('tokens.token',token2).orderBy('ts', 'desc').limit(1)
		.then(data =>{
			res.json(data)
		})
		.catch(err => {
			console.log(err)
			res.status(400).json('Wrong credentials')
			})
	}}
const dataget_one= (req,res,db) =>{
	const {token} = req.body;
	if(!token){
		return res.status(400).json('incorrect form submission');
	}
	else{
		db.select('*').from('tokens')
		.where('token','=',token)
		.then(data =>{
			res.json(data)
		})
		.catch(err => {
			console.log(err)
			res.status(400).json('Wrong credentials')
			})
	}}

const tokensget= (req,res,db) =>{
	const {user} = req.params;
	console.log("getdata from: "+user)
	if(!user){
		return res.status(400).json('incorrect form submission');
	}
	else{
		db.select('*').from('tokens')
		.where('email','=',user)
		.then(data =>{
			res.json(data)
		})
		.catch(err => {
			console.log(err)
			res.status(400).json('Wrong credentials')
			})
	}
}
const tokendel= (req,res,db) =>{
			const {token}= req.body;
			console.log("tokendel: "+token)
			db.transaction(trx =>{
			trx.delete()
			.from('tokens')
			.where('token','=',token)
			.returning('token')
			.then(user =>{res.json(user)})
			.then(trx.commit)
			.catch(trx.rollback)
		})
}
const dataUpdate= (req,res,db) =>{
			const {token,name,measuring,units,devicename,tipo,show4,show5,show6} = req.body;
			db('tokens').update({
            	name: name,
            	measuring: measuring,
            	units: units,
            	devicename: devicename,
            	tipo: tipo,
            	show4:show4,
            	show5:show5,
            	show6:show6
				}).where('token','=',token)
			.then(data=>
				res.json(data))
			.catch()

}

const tokengen=(req,res,db)=>{
			const {email} = req.body;
			console.log("Req email: "+email)
			let test=0;
			let token =  gen();
			db.transaction(trx =>{
			trx.insert({
				token: token,
				email: email,
				tipo: 'temperature',
				units: 'ºC',
				name: 'new',
				measure: '',
				show1: 0,
				show2: 0,
				show3: 0,
				show4: 0,
				show5: 100,
				show6: 'Lineal',
			})
			.into('tokens')
			.returning('token')
			.then(user =>{
					res.json(token);
				})
			
			.then(trx.commit)
			.catch(trx.rollback)
		})}
	
	

const gen = () =>{
		var length= 32;
		var chars='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		var result = '';
	    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
	    return result
}

module.exports={
	gen: gen,
	datagetHandler: dataget,
	tokensHandler: tokensget,
	tokenGen: tokengen,
	tokenDel: tokendel,
	dataUpdate: dataUpdate,
	datadevice: dataget_one,
	dataget_last: dataget_last,
}