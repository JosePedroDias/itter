'use strict';

var fs = require('fs');
var http = require('http');

var request = require('request');



var PORT = 9999;



var SECRETS, CACHE = {};

var _secretsJ   = 'secrets.json';

var _profileJ   = 'profile.json';
var _followingJ = 'following.json';
var _postsJ     = 'posts.json';
var _postJ      = 'post.json';
var _timelineJ  = 'timeline.json';

var _profile    = 'profile';
var _post       = 'post';
var _delete     = 'delete';
var _follow     = 'follow';
var _unfollow   = 'unfollow';
var _new        = 'new';
var _secret     = 'secret';

var _PUBLIC_THENS    = [_profileJ, _followingJ, _postsJ, _postJ, _timelineJ];
var _PROTECTED_THENS = [_post, _delete, _follow, _unfollow, _profile, _new, _secret];
var _ALL_THENS       = _PUBLIC_THENS.concat(_PROTECTED_THENS);

/*
/user1/profile.json
/user1/following.json
/user1/posts.json
/user1/timeline.json

/user1/post?secret=pass1&content=hello%20world
/user1/delete?secret=pass1&post_created_at=1430755086024
/user1/follow?secret=pass1&target_user=http%3A%2F%2F127.0.0.1%3A9999%2Fuser
/user1/unfollow?secret=pass1&target_user=http%3A%2F%2F127.0.0.1%3A9999%2Fuser
/user1/profile?secret=pass3&name=User%203&description=things%20and%20stuff
/user3/new?secret=pass3
/user1/secret?secret=pass1&new_secret=pass11
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
};

/*
 {}
 {"a":"b"}
 {"a":"b","c":"d"}
 */
/*var appendToObject = function(objS, k, v) {
    var kS = JSON.stringify(k);
    var vS = JSON.stringify(v);
    var l = objS.length;
    return [ (l>2? objS.substring(0, l-1) + ',' : '{') , kS, ':', vS, '}'].join('');
};*/

//DESC
var byCreatedAt = function(o1, o2) { return o1['created_at'] < o2['created_at']; };

var appendToCacheProperty = function(user, key, o) {
    var arrS = CACHE[user][key];
    //console.log(arrS);
    arrS = appendToArray(arrS, o);
    //console.log(arrS);
    CACHE[user][key] = arrS;
    fs.writeFileSync([user, key].join('/'), arrS);
};

var removeFromCachePropertyWhen = function(user, key, testFn) {
    var arrS = CACHE[user][key];
    //console.log(arrS);
    var arr = JSON.parse(arrS);
    var it, I = arr.length;
    for (var i = 0; i < I; ++i) {
        it = arr[i];
        if (testFn(it)) {
            arr.splice(i, 1);
            break;
        }
    }
    arrS = JSON.stringify(arr);
    //console.log(arrS);
    CACHE[user][key] = arrS;
    fs.writeFileSync([user, key].join('/'), arrS);
};

var fullTimeline = function(user, res) {
    var followings = JSON.parse( CACHE[user][_followingJ] );
    var followingsLeft = followings.length;
    var items = [];
    followings.forEach(function(following) {
        request(following + '/posts.json', function(err, resp, body) {
            var user = resp.request.href;
            user = user.substring(0, user.length - 11);
            //console.log('**', resp.request.href);
            if (!err) {
                var theseItems = JSON.parse(body);
                theseItems.forEach(function(it) { it.from = user; }); // fill items with user param
                items = items.concat(theseItems);
            }
            --followingsLeft;

            if (followingsLeft === 0) {
                items.sort(byCreatedAt);
                go(res, JSON.stringify(items));
            }
        });
    });
};

var post = function(user, created_at, res) {
    var arrS = CACHE[user][_postsJ];
    var arr = JSON.parse(arrS);
    for (var i = 0, I = arr.length, it; i < I; ++i) {
        it = arr[i];
        if (it['created_at'] === created_at) {
            return go(res, JSON.stringify(it));
        }
    }
    go(res, 'POST NOT FOUND', 404);
};


// setting up secrets and cache
(function() {
	var o, secretsS = fs.readFileSync(_secretsJ).toString();
	SECRETS = JSON.parse(secretsS);
	for (var user in SECRETS) {
		o = {};
		o[_profileJ  ] = fs.readFileSync( [user, _profileJ  ].join('/') ).toString();
		o[_followingJ] = fs.readFileSync( [user, _followingJ].join('/') ).toString();
        o[_postsJ]     = fs.readFileSync( [user, _postsJ    ].join('/') ).toString();
        o[_timelineJ]  = fs.readFileSync( [user, _timelineJ ].join('/') ).toString();
		CACHE[user] = o;
	}
})();


// main loop
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
    var params = {};
    search.split('&').forEach(function(pair) {
        pair = pair.split('=');
        params[pair[0]] = decodeURIComponent(pair[1]);
    });
    //console.log(params);

	//console.log( JSON.stringify( [user, then, search] ) );

	if (user === '/' || (!(user in CACHE) && then !== _new) || !elInArr(then, _ALL_THENS)) { // invalid
		return go(res, 'INVALID API ENDPOINT: ' + u, 404);
	}

	if (elInArr(then, _PUBLIC_THENS)) { // public query
        if (then === _timelineJ) {
            return fullTimeline(user, res);
        }
        else if (then === _postJ) {
            try {
                if ('created_at' in params) {
                    params['created_at'] = parseInt(params['created_at'], 10);
                    return post(user, params['created_at'], res);
                }
                else { throw 'FIELDS MISSING: created_at'; }
            }
            catch (err) {
                return go(res, err, 412);
            }
        }
		var o = CACHE[user][then];
		return go(res, o);
	}

    if (then === _new && SECRETS[user]) {
        return go(res, 'UNAUTHORIZED ACCESS: user already exists', 403);
    }

    if (then === _new) {}
	else if (SECRETS[user] !== params.secret) {
		return go(res, 'UNAUTHORIZED ACCESS: no secret field or incorrect value', 403);
	}
    else {
        delete params.secret;
    }

	try {
        if (then === _new) {
            if ('secret' in params) {
                SECRETS[user] = params.secret;
                fs.writeFileSync('secrets.json', JSON.stringify(SECRETS));
                fs.mkdirSync(user);
                fs.writeFileSync(user+'/following.json', '[]');
                fs.writeFileSync(user+'/posts.json',     '[]');
                fs.writeFileSync(user+'/profile.json',   '{}');
                fs.writeFileSync(user+'/timeline.json',  '[]');
            }
            else { throw 'FIELDS MISSING: secret'; }
        }
		else if (then === _post) {
			params.created_at = Date.now();
			if ('content' in params) {
                appendToCacheProperty(user, _postsJ, params);
			}
			else { throw 'FIELDS MISSING: content'; }
		}
        else if (then === _delete) {
            if ('post_created_at' in params) {
                params['post_created_at'] = parseInt(params['post_created_at'], 10);
                removeFromCachePropertyWhen(user, _postsJ, function(it) { return it['created_at'] === params['post_created_at']; });
            }
            else { throw 'FIELDS MISSING: post_created_at'; }
        }
        else if (then === _follow) {
            if ('target_user' in params) {
                appendToCacheProperty(user, _followingJ, params['target_user']);
            }
            else { throw 'FIELDS MISSING: target_user'; }
        }
        else if (then === _unfollow) {
            if ('target_user' in params) {
                removeFromCachePropertyWhen(user, _followingJ, function(it) { return it === params['target_user']; });
            }
            else { throw 'FIELDS MISSING: target_user'; }
        }
        else if (then === _profile) {
            fs.writeFileSync(user+'/profile.json', JSON.stringify(params)); // TODO old params could stick if not passed, deleted if null passed
        }
        else if (then === _secret) {
            if ('new_secret' in params) {
                SECRETS[user] = params['new_secret'];
                fs.writeFileSync('secrets.json', JSON.stringify(SECRETS));
            }
            else { throw 'FIELDS MISSING: new_secret'; }
        }
		go(res, 'OK');
	} catch (err) {
		go(res, err, 412);
	}
});

console.log('serving itter endpoints on port %d...', PORT);
s.listen(PORT);
