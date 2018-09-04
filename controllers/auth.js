const authorized=(req,res,db,bcrypt)=>{
	  const {email,password} = req.body;
	  db.select('email','hash','key').from('login')
	  .where('email','=',email)
	  .then(data =>{
	    //console.log(data[0])
	    const isValid= bcrypt.compareSync(password,data[0].hash)
	    //console.log(isValid)
	    const keyok= (data[0].key==password) 
	    if (isValid || keyok){ 
	      //console.log(email+": authorized!")
	      res.json({"auth": true});
	    }else{
	      res.json({"auth": false})
	    }
	    })
	  .catch(err => {
	  	//console.log(err)
	    console.log(email+": Wrong credentials")})
	}
const pubauthorized=(req,res,db,bcrypt)=>{
	const {email,token} = req.body;
	 db.select('token').from('tokens').where('email','=',email)
    .then(data=>{
        var test=0;
        data.forEach(dato =>{
          if(token===dato.token){
            res.json({"auth": true});
            test++;
          }
        })
        if(test==0){
          console.log(email+": Invalid token, message rejected");
          res.json({"auth": false});
          return 0;
        }
  		})
    .catch(err =>{
    	console.log(err)
    })	
	}


module.exports ={
		authorized: authorized,
		pubauthorized: pubauthorized,
}