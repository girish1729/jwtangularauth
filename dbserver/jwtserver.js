var express = require('express')
var cors = require('cors');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var bodyParser = require('body-parser')
var email = require('emailjs');
var exec = require('child_process')
    .exec;

var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(cors());

var Config = require('./public/config/config.json');
// Nodejs encryption with CTR
var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'd6F3Efeq';


var jwt_secret = in2nConfig.jwt_secret;

var db = null;
var jwtmap = {};

function dbconn() {
    var pgp = require('pg-promise')(options);
    var connectionString = 'postgres://postgres:@localhost:5432/in2nsamples';
    db = pgp(connectionString);
}

dbconn();


function list_in2nallusers(req, res, next) {
    var company_id = req.params.company_id;
    var userlist = [];
    db.any('select user_id,name from in2nuser')
        .then(function (data) {
            data.forEach(function (val) {
                userlist.push(val.user_id + "," + val.name);
            });
            console.log(userlist);
            res.status(200)
                .json(userlist);
        })
        .catch(function (err) {
            return next(err);
        });
}

function in2n_passcheck(req, res) {
    var user = req.body.user;
    var pass = req.body.pass;
    var company = req.body.company;
    console.log(user);
    console.log(pass);
    console.log(company);
    db.one('select user_id,name,email,pass from in2nuser ' +
            ' where company = $1' + 'and (name = $2 or email = $2);', [company, user])
        .then(function (data) {
            name = data.name, setpass = data.pass;
            email = data.email;
            user_id = data.user_id;
            console.log(name);
            console.log(email);
            company = parseInt(company);

            if (pass === setpass) {
                console.log('success');
                var payload = {
                    email: email,
                    user: name,
                    owner: user_id,
                    company: company
                };

                token = create_in2njwtauthtoken(payload);
                jwtmap[user_id] = token;
                return res.status(200)
                    .json({
                        token: token
                    });
            } else {
                console.log('failure');
                return res.status(401)
                    .send('Password failure')
            }
        }, function (err) {
            return res.status(401)
                .send('User not found');
        });
}


/* This part deals with JWT authentication XXX */

create_in2njwtauthtoken = function (payload) {

    var token = jwt.sign(payload, jwt_secret);
    //console.log(token);
    var tok_exp = jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60),
        data: payload
    }, jwt_secret);

    return token;
};

verify_in2njwtauth = function (token, res, next) {
    console.log(token);

    /*
    var decoded = jwt.verify(token, jwt_secret);
    console.log(decoded.email);
	*/

    jwt.verify(token, jwt_secret, function (err, decoded) {
        if (!decoded) {
            console.log("Auth failed");
            return res.status(401)
                .send("Unauthorized");
        }
        console.log("Auth succeeded");
        console.log(decoded);
        console.log(decoded.email);
        console.log(decoded.user);
        console.log(decoded.company);
        console.log(decoded.owner);
        return res.status(200)
            .json({
                company: decoded.company,
                owner: decoded.owner
            });
    });

}

//token = init_in2njwtauth();

/*
try {
  var decoded = jwt.verify(token, 'wrong-secret');
} catch(err) {
	console.log("Reject auth");
}

jwt.verify(token, 'wrong-secret', function(err, decoded) {
	if(!decoded) {
		console.log("rejected");
	}
});
*/

createsecret = function (plaintext) {
    return encrypt(plaintext);
};

/******************** XXX Start endpoints **************/

/* XXX catch all */
app.all('*', function (req, res, next) {
    console.log(req.path);
    next();
});

/* R of cRud XXX */
app.get('/getallusers', function (req, res, next) {
    list_in2nallusers(req, res, next);
});

app.get('/getemails', function (req, res, next) {
    list_in2nemails(req, res, next);
});

app.get('/tokencheck/:token', function (req, res, next) {
    var token = req.params.token;
    verify_in2njwtauth(token, res, next);
});

app.get('/decryptverify/:secret/:hash', function (req, res, next) {
    var secret = req.params.secret;
    var codedid = req.params.hash;
    verify_in2nactivation(secret, codedid, res, next);
});


app.get('/getjwt/:user_id', function (req, res, next) {
    var user_id = req.params.user_id;
    if (jwtmap[user_id] === undefined) {
        return res.status(401)
            .send("JWT not found");
    }
    res.status(200)
        .json({
            token: jwtmap[user_id]
        });
});

/* XXX Start express listen */

app.listen(5000, function() {
console.log("DB server listening at 5000");
});
