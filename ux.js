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
            <a class="itter itter-profile">
                <div class="avatar" style="background-image: url('{{avatar}}')"></div>
                <div class="avatar-rest">
                    <div class="name">{{name}}</div>
                    <div class="user">{{user}}</div>
                </div>
                <div class="desc">{{description}}</div>
            </a>*/}
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

    //applyTemplate(tpl1, {name:'Johnny', age:20});



    var renderProfile = function(user, sel) {
        applyTpl(
            'profile',
            {
                avatar:      'https://avatars0.githubusercontent.com/u/525733?s=140',
                name:        'NAME',
                user:        'USER',
                description: 'DESC'
            },
            sel
        );
    };

    var renderPost = function(user, created_at, sel) {

    };

    var renderTimeline = function(user, sel) {

    };

    var postForm = function(user, sel) {

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