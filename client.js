(function(win) {
    'use strict';


    var _posts     = 'posts.json';
    var _timeline  = 'timeline.json';
    var _profile   = 'profile.json';
    var _following = 'following.json';
    var _post      = 'post';


    var ajax = function(o) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', o.uri, true);
        if ('range' in o) {
            xhr.setRequestHeader('Range', ['bytes=', (o.range[0]||''), '-', (o.range[1]||'')].join(''));
        }
        var cbInner = function() {
            if (xhr.readyState === 4 && xhr.status > 199 && xhr.status < 300) {
                return o.cb(null, o.skipParse ? xhr.response : JSON.parse(xhr.response));
            }
            o.cb('error requesting ' + o.uri);
        };
        xhr.onload  = cbInner;
        xhr.onerror = cbInner;
        xhr.send(null);
    };

    var encodeUriParams = function(uri, params) {
        var arr = [uri, '?'];
        var k, v;
        for (k in params) {
            v = encodeURIComponent(params[k]);
            arr = arr.concat([k, '=', v, '&']);
        }
        arr.pop();
        return arr.join('');
    };



    var AUTH = {};
    //var CACHE = {};

    var amILoggedIn = function() {
        return 'user' in AUTH && 'secret' in AUTH;
    };

    var logIn = function(user, secret) {
        AUTH.user   = user;
        AUTH.secret = secret;
    };

    var logOut = function() {
        AUTH = {};
    };

    var getFollowing = function(user, cb) {
        ajax({
            uri: user + '/' + _following,
            cb:  cb
        });
    };

    var getOwnFollowing = function(cb) {
        if (!this.amILoggedIn()) {
            return cb('you need to be logged in first!');
        }
        this.getFollowing(AUTH.user, cb);
    };

    var getPosts = function(user, cb) {
        ajax({
            uri: user + '/' + _posts,
            cb:  cb
        });
    };

    var getOwnPosts = function(cb) {
        if (!this.amILoggedIn()) {
            return cb('you need to be logged in first!');
        }
        this.getPosts(AUTH.user, cb);
    };

    var post = function(o) {
        if (!this.amILoggedIn()) {
            return cb('you need to be logged in first!');
        }
        o.secret = AUTH.secret;
        ajax({
            uri:       encodeUriParams(AUTH.user + '/' + _post, o),
            skipParse: true,
            cb :       function(){}
        });
    };

    var getTimeline = function(user, cb) {
        ajax({
            uri: user + '/' + _timeline,
            cb:  cb
        });
    };

    var getOwnTimeline = function(cb) {
        if (!this.amILoggedIn()) {
            return cb('you need to be logged in first!');
        }
        this.getTimeline(AUTH.user, cb);
    };

    var getProfile = function(user, cb) {
        ajax({
            uri: user + '/' + _profile,
            cb:  cb
        });
    };

    var getOwnProfile = function(cb) {
        if (!this.amILoggedIn()) {
            return cb('you need to be logged in first!');
        }
        this.getProfile(AUTH.user, cb);
    };

    win.itter = {
        amILoggedIn:     amILoggedIn,
        logIn:           logIn,
        logOut:          logOut,
        getOwnFollowing: getOwnFollowing,
        getFollowing:    getFollowing,
        getOwnPosts:     getOwnPosts,
        getPosts:        getPosts,
        getOwnTimeline:  getOwnTimeline,
        getTimeline:     getTimeline,
        getOwnProfile:   getOwnProfile,
        getProfile:      getProfile,
        post:            post
    };

    /*
        var log = function() { console.log(arguments); };
        var log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };
        itter.logIn('http://127.0.0.1:9999/user1', 'pass1')
        itter.getOwnPosts(log2);
        itter.getOwnFollowing(log2);
        itter.post({content:'hello world'});
    */
})(this);
