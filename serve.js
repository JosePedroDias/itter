'use strict';

var fs = require('fs');
var http = require('http');


var SECRETS, CACHE = {};

var _secrets   = 'secrets.json';

var _profile   = 'profile.json';
var _following = 'following.json';
var _posts     = 'posts.json';
//var _timeline  = 'timeline.json';

var _post     = 'post';
var _delete   = 'delete';
var _follow   = 'follow';
//var _unfollow = 'unfollow';

var _PUBLIC_THENS = [_profile, _following, _posts/*, _timeline*/];
var _PROTECTED_THENS = [_post, _delete, _follow/*, _unfollow*/];
var _ALL_THENS = _PUBLIC_THENS.concat(_PROTECTED_THENS);

/*
/user1/profile.json
/user1/following.json
/user1/posts.json
/user1/timeline.json TODO

/user1/post?secret=pass1&content=hello world
/user1/follow?secret=pass1&target_user=http://stage.sl.pt/user2
/user1/delete?secret=pass1& TODO
/user1/unfollow?secret=pass1&target_user=http://stage.sl.pt/user2 TODO
*/


// aux
var elInArr = function(el, arr) {
    return arr.indexOf(el) !== -1;
}

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

/*
  []
  [{}]
  [{},{}]
 */
var appendToArray = function(arrS, o) {
    var oS = JSON.stringify(o);
    var l = arrS.length;
	return [ (l>2? arrS.substring(0, l-1) + ',' : '[') , oS, ']'].join('');
	return arrS;
};

var appendToCacheProperty = function(user, key, o) {
    var arrS = CACHE[user][key];
    console.log(arrS);
    arrS = appendToArray(arrS, o);
    console.log(arrS);
    CACHE[user][key] = arrS;
    fs.writeFileSync([user, key].join('/'), arrS);
};


// setting up secrets and cache
(function() {
	var o, secretsS = fs.readFileSync(_secrets).toString();
	SECRETS = JSON.parse(secretsS);
	for (var user in SECRETS) {
		o = {};
		o[_profile  ] = fs.readFileSync( [user, _profile  ].join('/') ).toString();
		o[_following] = fs.readFileSync( [user, _following].join('/') ).toString();
        o[_posts]     = fs.readFileSync( [user, _posts    ].join('/') ).toString();
        //o[_timeline]  = fs.readFileSync( [user, _timeline ].join('/') ).toString();
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

	if (user === '/' || !(user in CACHE) || !elInArr(then, _ALL_THENS)) { // invalid
		return go(res, 'INVALID API ENDPOINT', 404);
	}

	if (elInArr(then, _PUBLIC_THENS)) { // public query
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
		if (then === _post) {
			params.created_at = Date.now();
			if ('content' in params) {
                appendToCacheProperty(user, _posts, params);
			}
			else {
				throw 'FIELDS MISSING';
			}
		}
        else if (then === _follow) {
            if ('target_user' in params) {
                appendToCacheProperty(user, _posts, params['target_user']);
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
