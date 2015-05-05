(function(win) {
    'use strict';


    var _postsJ     = 'posts.json';
    var _postJ     = 'post.json';
    var _profileJ   = 'profile.json';
    var _followingJ = 'following.json';
    var _timelineJ  = 'timeline.json';
    var _post       = 'post';
    var _profile    = 'profile';
    var _lh_auth_key = 'ITTER_AUTH';

    var no_op = function() {};

    var ajax = function(o) {
        if (!o.cb) { o.cb = no_op; }
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

    var getMyUser = function() {
        return AUTH.user;
    };

    var attemptLogIn = function() {
        try {
            var a = localStorage.getItem(_lh_auth_key)
            this.logIn(a.user, a.secret);
            return true;
        } catch (ex) {
            return false;
        }
    }

    var logIn = function(user, secret) {
        AUTH.user   = user;
        AUTH.secret = secret;
        try {
            localStorage.setItem(_lh_auth_key, JSON.stringify(AUTH));
        } catch (ex) {}
    };

    var logOut = function(clear_storage) {
        AUTH = {};
        if (clear_storage) {
            localStorage.removeItem(_lh_auth_key);
        }
    };

    var getFollowing = function(user, cb) {
        ajax({
            uri: user + '/' + _followingJ,
            cb:  cb
        });
    };

    var getOwnFollowing = function(cb) {
        if (!this.amILoggedIn()) { return cb('you need to be logged in first!'); }
        this.getFollowing(AUTH.user, cb);
    };

    var getPosts = function(user, cb) {
        ajax({
            uri: user + '/' + _postsJ,
            cb:  cb
        });
    };

    var getPost = function(user, created_at, cb) {
        ajax({
            uri: user + '/' + _postJ + '?created_at=' + created_at,
            cb:  cb
        });
    };

    var getOwnPosts = function(cb) {
        if (!this.amILoggedIn()) { return cb('you need to be logged in first!'); }
        this.getPosts(AUTH.user, cb);
    };

    var writePost = function(o, cb) {
        if (!this.amILoggedIn()) { return cb('you need to be logged in first!'); }
        o.secret = AUTH.secret;
        ajax({
            uri:       encodeUriParams(AUTH.user + '/' + _post, o),
            skipParse: true,
            cb :       cb
        });
    };

    var getTimeline = function(user, cb) {
        ajax({
            uri: user + '/' + _timelineJ,
            cb:  cb
        });
    };

    var getOwnTimeline = function(cb) {
        if (!this.amILoggedIn()) { return cb('you need to be logged in first!'); }
        this.getTimeline(AUTH.user, cb);
    };

    var getProfile = function(user, cb) {
        ajax({
            uri: user + '/' + _profileJ,
            cb:  cb
        });
    };

    var getOwnProfile = function(cb) {
        if (!this.amILoggedIn()) { return cb('you need to be logged in first!'); }
        this.getProfile(AUTH.user, cb);
    };

    var setProfile = function(o, cb) {
        if (!this.amILoggedIn()) { return cb('you need to be logged in first!'); }
        ajax({
            uri:       encodeUriParams(AUTH.user + '/' + _profile, o),
            skipParse: true,
            cb :       cb
        });
    };

    var follow = function(target_user, cb) {
        ajax({
            uri:       encodeUriParams(AUTH.user + '/' + _follow, {target_user:target_user}),
            skipParse: true,
            cb :       cb
        });
    };

    var unfollow = function(target_user, cb) {
        ajax({
            uri:       encodeUriParams(AUTH.user + '/' + _unfollow, {target_user:target_user}),
            skipParse: true,
            cb :       cb
        });
    };

    var deletePost = function(post_created_at, cb) {
        ajax({
            uri:       encodeUriParams(AUTH.user + '/' + _delete, {post_created_at:post_created_at}),
            skipParse: true,
            cb :       cb
        });
    };

    win.itter = {
        amILoggedIn:     amILoggedIn,
        getMyUser:       getMyUser,
        attemptLogIn:    attemptLogIn,
        logIn:           logIn,
        logOut:          logOut,
        getOwnFollowing: getOwnFollowing,
        getFollowing:    getFollowing,
        follow:          follow,
        unfollow:        unfollow,
        getOwnPosts:     getOwnPosts,
        getPosts:        getPosts,
        getPost:         getPost,
        getOwnTimeline:  getOwnTimeline,
        getTimeline:     getTimeline,
        getOwnProfile:   getOwnProfile,
        getProfile:      getProfile,
        setProfile:      setProfile,
        writePost:       writePost,
        deletePost:      deletePost
    };



    // TODO TEMP
    window.i = win.itter;
    win.log = function() { console.log(arguments); };
    win.log2 = function(err, o) { if (err) { return console.error(err); } console.log(o); };
    i.logIn('http://127.0.0.1:9999/user1', 'pass1');

    /*
        i.getOwnPosts(log2);
        i.getOwnFollowing(log2);
        i.post({content:'hello world'});
    */
})(this);
