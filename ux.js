(function(win) {
    'use strict';

    // poor man's templating
    var fetchFnComment = function(f) {
        return f.toString()
            .replace(/^[^\/]+\/\*!?/, '')
            .replace(/\*\/[^\/]+$/,   '');
    };

    var default_avatar = 'http://www.pissedconsumer.com/images/avatars/avatar-default-128.png';

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
            <div class="itter itter-post">
                <a class="profile" href="{{u_user}}/profile.json" target="_blank">
                    <div class="avatar" style="background-image: url('{{u_avatar}}')"></div>
                    <div class="name">{{u_name}}</div>
                </a>
                <a class="profile-rest" href="{{url}}" target="_blank">
                    <i>{{created_at_h}}</i><br/>
                    {{content}}
                </a>
            </div>*/},
        timeline: function() {/*
            <div class="itter itter-timeline"></div>*/},
        form: function() {/*
            <div class="itter itter-form">
                <div class="login-ctn">
                    <div>
                        <label>user</label>
                        <input class="user" type="text" value="">
                    </div>
                    <div>
                        <label>secret</label>
                        <input class="secret" type="password" value="">
                    </div>
                    <button class="log-in">login</button>
                </div>
                <div class="compose-ctn">
                    <textarea class="content"></textarea>
                    <button class="send-post">post</button>
                    <button class="log-out">logout</button>
                </div>
            </div>*/}
    };

    for (var k in tpls) {
        tpls[k] = fetchFnComment( tpls[k] );
    }

    var qs = function qs(sel, ctx) {
        if (typeof sel !== 'string') { return sel; }
        if (typeof ctx === 'string') { ctx = qs(ctx); }
        return (ctx || document).querySelector(sel);
    };

    /**
     * modes: [before|after][begin|end], outerHTML or innerHTML(default)
     */
    var applyTpl = function(tplName, model, mode, el, ctx) {
        el = qs(el, ctx);
        var tpl = tpls[tplName];
        for (var k in model) {
            tpl = tpl.replace( new RegExp('({{'+k+'}})', 'g'), model[k] );
        }

        switch (mode) {
            case 'innerHTML':
            case undefined:
                el.innerHTML = tpl;
                break;

            case 'outerHTML':
                el.outerHTML = tpl;
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
            d.getFullYear(),
            ' at ',
            d.getHours(),
            ':',
            zeroPad( d.getMinutes() )
        ].join('');
    };



    var renderProfile = function(user_url, sel) {
        win.itter.getProfile(user_url, function(err, profile) {
            if (err) { return console.error(err); }
            profile.user = user_url;
            if (!profile.avatar) { profile.avatar = default_avatar; }
            applyTpl('profile', profile, 'innerHTML', sel);
        });
    };

    var _renderPost = function(post, sel, mode) {
        var user_url = win.itter.getUserFromUrl(post.url);
        win.itter.getProfile(user_url, function(err, profile) {
            if (err) { return console.error(err); }
            post.u_user = user_url;
            post.u_name = profile.name || '';
            post.u_avatar = profile.avatar || default_avatar;
            post.created_at_h = humanTS(post.created_at);
            applyTpl('post', post, mode || 'innerHTML', sel);
        });
    };

    var renderPost = function(post_or_post_url, sel) {
        if (typeof post_or_post_url === 'object') {
            return _renderPost(post_or_post_url, sel);
        }
        win.itter.getPost(post_or_post_url, function(err, post) {
            if (err) { return console.error(err); }
            _renderPost(post, sel);
        });
    };

    var renderTimeline = function(user_url, sel) {
        win.itter.getTimeline(user_url, function(err, timeline) {
            if (err) { return console.error(err); }
            applyTpl('timeline', timeline, 'innerHTML', sel);
            var timelineEl = qs('.itter-timeline', sel);
            timeline.forEach(function(post) {
                var proxyEl = document.createElement('div'); // to ensure posts order doesn't get messed up by async requests
                timelineEl.appendChild(proxyEl);
                _renderPost(post, proxyEl, 'outerHTML');
            });
        });
    };

    var postForm = function(sel) {
        win.itter.attemptLogIn();

        applyTpl('form', {}, 'innerHTML', sel);
        var formEl = qs('.itter-form', sel);
        formEl.classList.add( win.itter.amILoggedIn() ? 'at-compose' : 'at-login' );

        var userEl        = qs('.user',      formEl);
        var secretEl      = qs('.secret',    formEl);
        var contentEl     = qs('.content',   formEl);
        var logInEl       = qs('.log-in',    formEl);
        var logOutEl      = qs('.log-out',   formEl);
        var sendPostEll   = qs('.send-post', formEl);

        var toggleAt = function() {
            formEl.classList.toggle('at-login');
            formEl.classList.toggle('at-compose');
        };

        logInEl.addEventListener('click', function() {
            win.itter.logIn(userEl.value, secretEl.value);
            toggleAt();
        });
        logOutEl.addEventListener('click', function() {
            userEl.value = '';
            secretEl.value = '';
            win.itter.logOut(true);
            toggleAt();
        });
        sendPostEll.addEventListener('click', function() {
            win.itter.writePost({content:contentEl.value}, function(err) {
                if (!err) { contentEl.value = ''; }
                window.alert(err || 'OK!');
            });
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