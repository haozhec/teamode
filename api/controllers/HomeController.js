module.exports = {

	index: function(req, res){
		sails.log.info(JSON.stringify(req.session.user));
		if (req.session.user){
			res.view('home/dashboard');
		}
		else {
			res.redirect('/login', 301);
		}
	}
	
}