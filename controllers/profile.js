const profileHandler = (req,res,db) =>{
	const {id} = req.params;
	db.select('*').from('users').where('id',id)
	.then(user=>{
		if(user.length){
			res.json(user);
			console.log(user)
		}else{
			res.status(404).json('no such user');
		}

	})
	.catch(err=>{
			res.status(404).json('Error');
		})
}

module.exports={
	profileHandler: profileHandler
}