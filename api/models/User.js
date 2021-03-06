/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

 var when = require('when');
 var validator = require('validator');
 module.exports = {

  attributes: {
  	
  	username: {
  		type: 'string',
  		maxLength: 20,
  		minLength: 3,
  		required: true
  	},

  	firstname: {
  		type: 'string',
  		maxLength: 20,
  		minLength: 3,
  	},

  	lastname: {
  		type: 'string',
  		maxLength: 20,
  		minLength: 3,
  	},
  	
  	password: {
  		type: 'string',
  	},

  	email: {
  		type:'email',
  		required: true
  	},

    boards: function(callback){
      Board.findByOwnerId(this.id).done(function(err, bds){
        callback(err, bds);
      });
    },

    canAddList: function(boardId){
      //Todo
      return true;
    }



  	/* e.g.
  	nickname: 'string'
  	*/

  },

  checkNameNotExist : function(username){
    return when.promise(function(resolve, reject, notify) {
      User.findOneByUsername(username).done(function(err, usr){
        if (err){
          sails.log.error(error);
          reject({error: 500, message: "DB error"});
        } else if (usr){
          sails.log.debug(username + " exist");
          reject({error: 500, message: "user exist"});
        } else {
          sails.log.info(username + " OK");
          resolve();
        }
      });
    });

  },

  checkNameExist : function(username){
    return when.promise(function(resolve, reject, notify) {
      User.findOneByUsername(username).done(function(err, usr){
        if (err){
          reject({error: 500, message: "DB error"});
        } else if (usr){
          resolve(usr);
        } else {
          reject({error: 500, message: "user not exist"});
        }
      });
    });

  },
  checkEmailNotExist : function(email){
    return when.promise(function(resolve, reject, notify) {
      User.findOneByEmail(email).done(function(err, usr){
        if (err){
          sails.log.error(error);
          reject({error: 500, message: "DB error"});
        } else if (usr){
          sails.log.debug(email + " exist");
          reject({error:500, message: "email exist"});
        } else {
          sails.log.info(email + " OK");
          resolve();
        }
      });
    });

  },

  createNewUser : function(newUser){
    var hasher = require("password-hash");
    newUser.password = hasher.generate(newUser.password);
    return when.promise(function(resolve, reject, notify){
      User.create(newUser).done(function(error, user) { 
        if (error){
          sails.log.error(JSON.stringify(error));
          reject({error: 500, message: "DB error"});
        }
        else {
          sails.log.info("user:" + user.username + " created")
          resolve(user);
        }
      });
    });
  },

  add: function (newUser){
    if (newUser.username && 
      newUser.password  &&
      newUser.email ){
      if (!(/^[A-Za-z0-9_-]{3,20}$/.test(newUser.username))){
        sails.log.debug("username:" + newUser.username + " format not correct");
        return when.reject({error: 500, message: "invalid username format"});
      }  
      if (!(/^.{6,20}$/.test(newUser.password))){
        sails.log.debug("password:" + newUser.password + " format not correct");
        return when.reject({error:500, message: "invalid password format"});
      }  

      if (!validator.isEmail(newUser.email)){
        sails.log.debug("email:" + newUser.email + " format not correct");
        return when.reject({error:500, message: "invalid email format"});
      }  
      return when(User.checkNameNotExist(newUser.username))
      .then (function() {
        return User.checkEmailNotExist(newUser.email);
      })
      .then(function(){
        return User.createNewUser(newUser);
      });

    }
    else {
      sails.log.debug("required information not complete " + JSON.stringify(newUser));
      return when.reject({error:500, message: "required information not complete"});
    }
  },

  //given the username and password, to see if they match;
  check: function (reqUser){
    if (reqUser.username && 
        reqUser.password){
      return when.promise(function(resolve, reject, notify) {
          User.findOneByUsername(reqUser.username).done(function(err, user){
          if (err){
            reject({error: 500, message: "DB Error"});
          } else if (user === undefined){
            reject({error: 500, message: "user not exist"});
          }
          else {
            var hasher = require("password-hash");
            if (hasher.verify(reqUser.password, user.password)){
              resolve(user);
            }
            else {
              reject({error: 500, message: "password not correct"});
            }
          }
        });
      })
    }
    else {
      return when.reject({error: 500, message: "please input username and password"});
    }
  },


};
