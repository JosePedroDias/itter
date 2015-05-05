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
            <a class="itter itter-post" href="{{user}}" target="_blank">
            </a>*/},
        timeline: function() {/*
            <a class="itter itter-timeline" href="{{url}}" target="_blank">
            </a>*/},
        form: function() {/*
            <div class="itter itter-form">
            </div>*/}
    };

    for (var k in tpls) {
        tpls[k] = fetchFnComment( tpls[k] );
    }

    var applyTpl = function(tplName, model, el, ctx) {
        if (typeof el === 'string') {
            el = (ctx || document).querySelector(el);
        }
        var tpl = tpls[tplName];
        for (var k in model) {
            tpl = tpl.replace( new RegExp('({{'+k+'}})', 'g'), model[k] );
        }
        el.innerHTML = tpl;
    };



    // TODO TEMP
    var profile = {
        "name":        "User 1",
        "avatar":      "https://secure.gravatar.com/avatar/5aecee0248f70bcbf79c82e8a87a4e78.jpg?s=128&d=https%3A%2F%2Fcodebits.eu%2Flogos%2Fdefaultavatar.jpg",
        "languages":   "en,pt",
        "description": "lorem ipsum"
    };
    var post = {};
    var timeline = [];

    var renderProfile = function(user, sel) {
        profile.user = user;
        applyTpl('profile', profile, sel);
    };

    var renderPost = function(post_url, sel) {
        applyTpl('post', post, sel);
    };

    var renderTimeline = function(user, sel) {
        applyTpl('timeline', timeline, sel);
    };

    var postForm = function(user, sel) {
        applyTpl('form', {}, sel);
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