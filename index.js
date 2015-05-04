var fs = require('fs');
var http = require('http');


var SECRETS, CACHE = {};

var _o = 'own.json';
var _f = 'following.json';

var _p = 'post';
var _d = 'delete';
//var _ff = 'follow';
//var _uf = 'unfollow';

var _ = [_o, _f, _p, _d]; // thens
var __ = [_o, _f]; // public thens

/*
/user1/own.json
/user1/following.json
/user1/post?secret=pass1&content=hello world
*/


// aux
var go = function(res, content, code) {
	if (code === undefined) { code = 200; }
	console.log(code);
	//console.log(content);
	res.writeHead(code, {
		'Content-Type':                'application/json',
		'Access-Control-Allow-Origin': '*'
	});
	res.end(content);
};

var append = function(user, key, o) {
	var arr = JSON.parse( CACHE[user][key] );
	arr.push(o);
	var v = JSON.stringify(arr);
	CACHE[user][key] = v;
	fs.writeFileSync([user, key].join('/'), v);
};


// setting up secrets and cache
(function() {
	var o, secretsS = fs.readFileSync('secrets.json');
	SECRETS = JSON.parse(secretsS);
	for (var user in SECRETS) {
		o = {};
		o[_o] = fs.readFileSync( [user, _o].join('/') ).toString();
		o[_f] = fs.readFileSync( [user, _f].join('/') ).toString();
		CACHE[user] = o;
	}
})();


// ...
var s = http.createServer(function(req, res) {
	var u = req.url;
	console.log('\n' + u);

	var i = u.indexOf('/', 1);
	var user = u.substring(1, i);
	var then = u.substring(i + 1);
	var search = '';
	var ii = u.indexOf('?', i);
	if (ii !== -1) {
		search = u.substring(ii + 1);
		then = u.substring(i + 1, ii);
	}
	//console.log( JSON.stringify( [user, then, search] ) );

	if (user === '/' || !(user in CACHE) || _.indexOf(then) === -1) { // invalid
		return go(res, 'INVALID API ENDPOINT', 404);
	}

	if (__.indexOf(then) !== -1) { // public query
		var o = CACHE[user][then];
		return go(res, o);
	}

	var params = {}; // post or delete
	search.split('&').forEach(function(pair) {
		pair = pair.split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	});
	//console.log(params);
	//return go(res, JSON.stringify(params));

	if (SECRETS[user] !== params.secret) {
		return go(res, 'UNAUTHORIZED ACCESS', 403);
	}
	delete params.secret;

	try {
		if (then === 'post') {
			params.created_at = Date.now();
			if ('content' in params) {
				append(user, _o, params);
			}
			else {
				throw 'FIELDS MISSING';
			}
		}
		go(res, 'OK');
	} catch (err) {
		go(res, err, 412);
	}
});
s.listen(9999);
