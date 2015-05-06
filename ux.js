(function(win) {
    'use strict';

    // poor man's templating
    var fetchFnComment = function(f) {
        return f.toString()
            .replace(/^[^\/]+\/\*!?/, '')
            .replace(/\*\/[^\/]+$/,   '');
    };

    var tpls = {
        profile: function() {/*
            <a class="itter itter-profile" href="{{user}}/profile.json" target="_blank">
                <div class="avatar" style="background-image: url('{{avatar}}')"></div>
                <div class="avatar-rest">
                    <div class="name">{{name}}</div>
                    <div class="user">{{user}}</div>
                </div>
                <div class="description">{{description}}</div>
                <div class="languages">{{languages}}</div>
            </a>*/},
        post: function() {/*
            <a class="itter itter-post" href="{{url}}" target="_blank">
                {{created_at_h}},
                {{content}}
            </a>*/},
        timeline: function() {/*
            <div class="itter itter-timeline">
            </div>*/},
        form: function() {/*
            <div class="itter itter-form">
                <textarea class="content"></textarea>
                <button class="send-post">post</button>
            </div>*/}
    };

    for (var k in tpls) {
        tpls[k] = fetchFnComment( tpls[k] );
    }

    /**
     * modes: [before|after][begin|end] or innerHTML(default)
     */
    var applyTpl = function(tplName, model, mode, el, ctx) {
        if (typeof el === 'string') {
            el = (ctx || document).querySelector(el);
        }
        var tpl = tpls[tplName];
        for (var k in model) {
            tpl = tpl.replace( new RegExp('({{'+k+'}})', 'g'), model[k] );
        }

        switch (mode) {
            case 'innerHTML':
            case undefined:
                el.innerHTML = tpl;
                break;

            case 'beforebegin':
            case 'afterbegin':
            case 'beforeend':
            case 'afterend':
                el.insertAdjacentHTML(mode, tpl);
                break;

            default:
                throw 'Unsupported mode: "' + mode + '"!';
        }
    };

    var qs = function qs(sel, ctx) {
        if (typeof ctx === 'string') { ctx = qs(ctx); }
        return (ctx || document).querySelector(sel);
    };

    var zeroPad = function(n) {
        return n < 10 ? '0'+n : n;
    };

    var _dows = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday'.split(' ');
    var _months = 'January February March April May June July August September October November December'.split(' ');

    var nth = function(n) {
        if (n === 1) { return 'st'; }
        if (n === 2) { return 'nd'; }
        if (n === 3) { return 'rd'; }
        return 'th';
    };

    var humanTS = function(ts) {
        //console.log(ts, typeof ts);
        var d = new Date(ts);
        return [
            _dows[ d.getDay() ],
            ', ',
            _months[ d.getMonth() ],
            ' the ',
            d.getDate(),
            nth( d.getDate() ),
            ' of ',

            ' ',
            d.getFullYear(),
            ' at ',
            d.getHours(),
            ':',
            zeroPad( d.getMinutes() )
        ].join('');
    };



    // TODO TEMP
    var profile = {
        "name":        "User 1",
        "avatar":      "https://secure.gravatar.com/avatar/5aecee0248f70bcbf79c82e8a87a4e78.jpg?s=128&d=https%3A%2F%2Fcodebits.eu%2Flogos%2Fdefaultavatar.jpg",
        "languages":   "en,pt",
        "description": "lorem ipsum"
    };
    var post = {
        "content":    "meu terceiro",
        "created_at": 1430909390633,
        "url":        "http://127.0.0.1:9999/user2/post.json?created_at=1430909390633"
    };
    var timeline = [
        {"content":"my first",    "created_at":1430761590645,"url":"http://127.0.0.1:9999/user3/post.json?created_at=1430761590645"},
        {"content":"meu primeiro","created_at":1430761612910,"url":"http://127.0.0.1:9999/user2/post.json?created_at=1430761612910"},
        {"content":"meu segundo", "created_at":1430761618310,"url":"http://127.0.0.1:9999/user2/post.json?created_at=1430761618310"},
        {"content":"meu terceiro","created_at":1430909390633,"url":"http://127.0.0.1:9999/user2/post.json?created_at=1430909390633"}
    ];

    var renderProfile = function(user, sel) {
        profile.user = user; // TODO FETCH USER AND STORE IN CACHE
        applyTpl('profile', profile, 'innerHTML', sel);
    };

    var _renderPost = function(post, sel, mode) {
        post.user = profile; // TODO
        post.created_at_h = humanTS(post.created_at);
        applyTpl('post', post, mode || 'innerHTML', sel);
    };

    var renderPost = function(post_or_post_url, sel) {
        var _post = (typeof post_or_post_url === 'string') ? post : post_or_post_url; // TODO FETCH POST
        _post.user = profile; // TODO FETCH USER FROM CACHE
        _renderPost(_post, sel);
    };

    var renderTimeline = function(user, sel) {
        applyTpl('timeline', timeline, 'innerHTML', sel);
        var timelineEl = qs('.itter-timeline', sel);
        timeline.forEach(function(post) {
            _renderPost(post, timelineEl, 'beforeend');
        });
    };

    var postForm = function(user, sel) {
        applyTpl('form', {}, 'innerHTML', sel);
        var taEl     = qs('textarea', sel);
        var buttonEl = qs('button', sel);
        buttonEl.addEventListener('click', function() {
            console.log(taEl.value);
        });
    };



    var itter_ux = {
        renderProfile:  renderProfile,
        renderPost:     renderPost,
        renderTimeline: renderTimeline,
        postForm:       postForm
    };

    win.itter_ux = itter_ux;



    // TODO TEMP
    win.iux = itter_ux;
})(this);