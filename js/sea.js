this.seajs = {
    _seajs: this.seajs
};
seajs.version = '1.0.1';
seajs._data = {
    config: {
        debug: '%DEBUG%',
        preload: []
    },
    memoizedMods: {},
    pendingMods: []
};
seajs._util = {};
seajs._fn = {}; 
(function(util) {
    var toString = Object.prototype.toString;
    var AP = Array.prototype;
    util.isString = function(val) {
        return toString.call(val) === '[object String]';
    };
    util.isFunction = function(val) {
        return toString.call(val) === '[object Function]';
    };
    util.isArray = Array.isArray ||
    function(val) {
        return toString.call(val) === '[object Array]';
    };
    util.indexOf = AP.indexOf ?
    function(arr, item) {
        return arr.indexOf(item);
    }: function(arr, item) {
        for (var i = 0,
        len = arr.length; i < len; i++) {
            if (arr[i] === item) {
                return i;
            }
        }
        return - 1;
    };
    var forEach = util.forEach = AP.forEach ?
    function(arr, fn) {
        arr.forEach(fn);
    }: function(arr, fn) {
        for (var i = 0,
        len = arr.length; i < len; i++) {
            fn(arr[i], i, arr);
        }
    };
    util.map = AP.map ?
    function(arr, fn) {
        return arr.map(fn);
    }: function(arr, fn) {
        var ret = [];
        forEach(arr,
        function(item, i, arr) {
            ret.push(fn(item, i, arr));
        });
        return ret;
    };
    util.filter = AP.filter ?
    function(arr, fn) {
        return arr.filter(fn);
    }: function(arr, fn) {
        var ret = [];
        forEach(arr,
        function(item, i, arr) {
            if (fn(item, i, arr)) {
                ret.push(item);
            }
        });
        return ret;
    };
    util.now = Date.now ||
    function() {
        return new Date().getTime();
    };
})(seajs._util); 
(function(util, data) {
    var config = data.config;
    util.error = function(o) {
        if (o.type === 'error') {
            throw 'Error occurs! ' + dump(o);
        } else if (config.debug && typeof console !== 'undefined') {
            console[o.type](dump(o));
        }
    };
    function dump(o) {
        var out = ['{'];
        for (var p in o) {
            if (typeof o[p] === 'number' || typeof o[p] === 'string') {
                out.push(p + ': ' + o[p]);
                out.push(', ');
            }
        }
        out.pop();
        out.push('}');
        return out.join('');
    }
})(seajs._util, seajs._data); 
(function(util, data, global) {
    var config = data.config;
    function dirname(path) {
        var s = path.match(/.*(?=\/.*$)/);
        return (s ? s[0] : '.') + '/';
    }
    function realpath(path) {
        path = path.replace(/([^:\/])\/+/g, '$1\/');
        if (path.indexOf('.') === -1) {
            return path;
        }
        var old = path.split('/');
        var ret = [],
        part,
        i = 0,
        len = old.length;
        for (; i < len; i++) {
            part = old[i];
            if (part === '..') {
                if (ret.length === 0) {
                    util.error({
                        message: 'invalid path: ' + path,
                        type: 'error'
                    });
                }
                ret.pop();
            } else if (part !== '.') {
                ret.push(part);
            }
        }
        return ret.join('/');
    }
    function normalize(url) {
        url = realpath(url);
        if (/#$/.test(url)) {
            url = url.slice(0, -1);
        } else if (url.indexOf('?') === -1 && !/\.(?:css|js)$/.test(url)) {
            url += '.js';
        }
        return url;
    }
    function parseAlias(id) {
        var alias = config['alias'];
        var parts = id.split('/');
        var last = parts.length - 1;
        parse(parts, 0);
        if (last) parse(parts, last);
        function parse(parts, i) {
            var part = parts[i];
            if (alias && alias.hasOwnProperty(part)) {
                parts[i] = alias[part];
            }
        }
        return parts.join('/');
    }
    function parseMap(url) {
        util.forEach(config['map'],
        function(rule) {
            if (rule && rule.length === 2) {
                url = url.replace(rule[0], rule[1]);
            }
        });
        return url;
    }
    function getHost(url) {
        return url.replace(/^(\w+:\/\/[^\/]*)\/?.*$/, '$1');
    }
    var loc = global['location'];
    var pageUrl = loc.protocol + '//' + loc.host + loc.pathname;
    if (pageUrl.indexOf('\\') !== -1) {
        pageUrl = pageUrl.replace(/\\/g, '/');
    }
    var id2UriCache = {};
    function id2Uri(id, refUrl, noAlias) {
        if (id2UriCache[id]) {
            return id;
        }
        if (!noAlias && config['alias']) {
            id = parseAlias(id);
        }
        refUrl = refUrl || pageUrl;
        var ret;
        if (isInlineMod(id)) {
            id = '.' + id.substring(1);
        }
        if (id.indexOf('://') !== -1) {
            ret = id;
        } else if (id.indexOf('./') === 0 || id.indexOf('../') === 0) {
            id = id.replace(/^\.\//, '');
            ret = dirname(refUrl) + id;
        } else if (id.indexOf('/') === 0) {
            ret = getHost(refUrl) + id;
        } else {
            ret = getConfigBase() + '/' + id;
        }
        ret = normalize(ret);
        if (config['map']) {
            ret = parseMap(ret);
        }
        id2UriCache[ret] = true;
        return ret;
    }
    function getConfigBase() {
        if (!config.base) {
            util.error({
                message: 'the config.base is empty',
                from: 'id2Uri',
                type: 'error'
            });
        }
        return config.base;
    }
    function ids2Uris(ids, refUri) {
        return util.map(ids,
        function(id) {
            return id2Uri(id, refUri);
        });
    }
    var memoizedMods = data.memoizedMods;
    function memoize(id, url, mod) {
        var uri;
        if (id) {
            uri = id2Uri(id, url, true);
        } else {
            uri = url;
        }
        mod.dependencies = ids2Uris(mod.dependencies, uri);
        memoizedMods[uri] = mod;
        if (id && url !== uri) {
            var host = memoizedMods[url];
            if (host) {
                augmentPackageHostDeps(host.dependencies, mod.dependencies);
            }
        }
    }
    function setReadyState(uris) {
        util.forEach(uris,
        function(uri) {
            if (memoizedMods[uri]) {
                memoizedMods[uri].ready = true;
            }
        });
    }
    function getUnReadyUris(uris) {
        return util.filter(uris,
        function(uri) {
            var mod = memoizedMods[uri];
            return ! mod || !mod.ready;
        });
    }
    function removeCyclicWaitingUris(uri, deps) {
        return util.filter(deps,
        function(dep) {
            return ! isCyclicWaiting(memoizedMods[dep], uri);
        });
    }
    function isCyclicWaiting(mod, uri) {
        if (!mod || mod.ready) {
            return false;
        }
        var deps = mod.dependencies || [];
        if (deps.length) {
            if (util.indexOf(deps, uri) !== -1) {
                return true;
            } else {
                for (var i = 0; i < deps.length; i++) {
                    if (isCyclicWaiting(memoizedMods[deps[i]], uri)) {
                        return true;
                    }
                }
                return false;
            }
        }
        return false;
    }
    function augmentPackageHostDeps(hostDeps, guestDeps) {
        util.forEach(guestDeps,
        function(guestDep) {
            if (util.indexOf(hostDeps, guestDep) === -1) {
                hostDeps.push(guestDep);
            }
        });
    }
    function isInlineMod(id) {
        return id.charAt(0) === '~';
    }
    util.dirname = dirname;
    util.id2Uri = id2Uri;
    util.ids2Uris = ids2Uris;
    util.memoize = memoize;
    util.setReadyState = setReadyState;
    util.getUnReadyUris = getUnReadyUris;
    util.removeCyclicWaitingUris = removeCyclicWaitingUris;
    util.isInlineMod = isInlineMod;
    util.pageUrl = pageUrl;
    if (config.debug) {
        util.realpath = realpath;
        util.normalize = normalize;
        util.parseAlias = parseAlias;
        util.getHost = getHost;
    }
})(seajs._util, seajs._data, this); 
(function(util, data) {
    var head = document.getElementsByTagName('head')[0];
    var isWebKit = navigator.userAgent.indexOf('AppleWebKit') !== -1;
    util.getAsset = function(url, callback, charset) {
        var isCSS = /\.css(?:\?|$)/i.test(url);
        var node = document.createElement(isCSS ? 'link': 'script');
        if (charset) node.setAttribute('charset', charset);
        assetOnload(node,
        function() {
            if (callback) callback.call(node);
            if (isCSS) return;
            if (!data.config.debug) {
                try {
                    if (node.clearAttributes) {
                        node.clearAttributes();
                    } else {
                        for (var p in node) delete node[p];
                    }
                } catch(x) {}
                head.removeChild(node);
            }
        });
        if (isCSS) {
            node.rel = 'stylesheet';
            node.href = url;
            head.appendChild(node);
        } else {
            node.async = true;
            node.src = url;
            head.insertBefore(node, head.firstChild);
        }
        return node;
    };
    function assetOnload(node, callback) {
        if (node.nodeName === 'SCRIPT') {
            scriptOnload(node, cb);
        } else {
            styleOnload(node, cb);
        }
        var timer = setTimeout(function() {
            cb();
            util.error({
                message: 'time is out',
                from: 'getAsset',
                type: 'warn'
            });
        },
        data.config.timeout);
        function cb() {
            cb.isCalled = true;
            callback();
            clearTimeout(timer);
        }
    }
    function scriptOnload(node, callback) {
        if (node.addEventListener) {
            node.addEventListener('load', callback, false);
            node.addEventListener('error', callback, false);
        } else {
            node.attachEvent('onreadystatechange',
            function() {
                var rs = node.readyState;
                if (rs === 'loaded' || rs === 'complete') {
                    callback();
                }
            });
        }
    }
    function styleOnload(node, callback) {
        if (node.attachEvent) {
            node.attachEvent('onload', callback);
        } else {
            setTimeout(function() {
                poll(node, callback);
            },
            0);
        }
    }
    function poll(node, callback) {
        if (callback.isCalled) {
            return;
        }
        var isLoaded = false;
        if (isWebKit) {
            if (node['sheet']) {
                isLoaded = true;
            }
        } else if (node['sheet']) {
            try {
                if (node['sheet'].cssRules) {
                    isLoaded = true;
                }
            } catch(ex) {
                if (ex.code === 1000) {
                    isLoaded = true;
                }
            }
        }
        if (isLoaded) {
            setTimeout(function() {
                callback();
            },
            1);
        } else {
            setTimeout(function() {
                poll(node, callback);
            },
            1);
        }
    }
    util.assetOnload = assetOnload;
    var interactiveScript = null;
    util.getInteractiveScript = function() {
        if (interactiveScript && interactiveScript.readyState === 'interactive') {
            return interactiveScript;
        }
        var scripts = head.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            if (script.readyState === 'interactive') {
                interactiveScript = script;
                return script;
            }
        }
        return null;
    };
    util.getScriptAbsoluteSrc = function(node) {
        return node.hasAttribute ? node.src: node.getAttribute('src', 4);
    };
    var noCacheTimeStamp = 'seajs-ts=' + util.now();
    util.addNoCacheTimeStamp = function(url) {
        return url + (url.indexOf('?') === -1 ? '?': '&') + noCacheTimeStamp;
    };
    util.removeNoCacheTimeStamp = function(url) {
        var ret = url;
        if (url.indexOf(noCacheTimeStamp) !== -1) {
            ret = url.replace(noCacheTimeStamp, '').slice(0, -1);
        }
        return ret;
    };
})(seajs._util, seajs._data); 
(function(util, data, fn, global) {
    var fetchingMods = {};
    var memoizedMods = data.memoizedMods;
    fn.load = function(ids, callback, refUrl) {
        if (util.isString(ids)) {
            ids = [ids];
        }
        var uris = util.ids2Uris(ids, refUrl);
        provide(uris,
        function() {
            var require = fn.createRequire({
                uri: refUrl
            });
            var args = util.map(uris,
				function(uri) {
					return require(uri);
            });
            if (callback) {
                callback.apply(global, args);
            }
        });
    };
    function provide(uris, callback) {
        var unReadyUris = util.getUnReadyUris(uris);
        if (unReadyUris.length === 0) {
            return onProvide();
        }
        for (var i = 0,
        n = unReadyUris.length,
        remain = n; i < n; i++) { (function(uri) {
                if (memoizedMods[uri]) {
                    onLoad();
                } else {
                    fetch(uri, onLoad);
                }
                function onLoad() {
                    var deps = (memoizedMods[uri] || 0).dependencies || [];
                    var m = deps.length;
                    if (m) {
                        deps = util.removeCyclicWaitingUris(uri, deps);
                        m = deps.length;
                    }
                    if (m) {
                        remain += m;
                        provide(deps,
                        function() {
                            remain -= m;
                            if (remain === 0) onProvide();
                        });
                    }
                    if (--remain === 0) onProvide();
                }
            })(unReadyUris[i]);
        }
        function onProvide() {
            util.setReadyState(unReadyUris);
            callback();
        }
    }
    function fetch(uri, callback) {
        if (fetchingMods[uri]) {
            util.assetOnload(fetchingMods[uri], cb);
        } else {
            data.pendingModIE = uri;
            fetchingMods[uri] = util.getAsset(getUrl(uri), cb, data.config.charset);
            data.pendingModIE = null;
        }
        function cb() {
            if (data.pendingMods) {
                util.forEach(data.pendingMods,
                function(pendingMod) {
                    util.memoize(pendingMod.id, uri, pendingMod);
                });
                data.pendingMods = [];
            }
            if (fetchingMods[uri]) {
                delete fetchingMods[uri];
            }
            if (!memoizedMods[uri]) {
                util.error({
                    message: 'can not memoized',
                    from: 'load',
                    uri: uri,
                    type: 'warn'
                });
            }
            if (callback) {
                callback();
            }
        }
    }
    function getUrl(uri) {
        var url = uri;
        if (data.config.debug == 2) {
            url = util.addNoCacheTimeStamp(url);
        }
        return url;
    }
})(seajs._util, seajs._data, seajs._fn, this); 
(function(fn) {
    fn.Module = function(id, deps, factory) {
        this.id = id;
        this.dependencies = deps || [];
        this.factory = factory;
    };
})(seajs._fn); 
(function(util, data, fn) {
    fn.define = function(id, deps, factory) {
        if (arguments.length === 1) {
            factory = id;
            id = '';
        } else if (util.isArray(id)) {
            factory = deps;
            deps = id;
            id = '';
        }
        if (!util.isArray(deps) && util.isFunction(factory)) {
            deps = parseDependencies(factory.toString());
        }
        var mod = new fn.Module(id, deps, factory);
        var url;
        if (util.isInlineMod(id)) {
            url = util.pageUrl;
        } else if (document.attachEvent && !window.opera) {
            var script = util.getInteractiveScript();
            if (script) {
                url = util.getScriptAbsoluteSrc(script);
                if (data.config.debug == 2) {
                    url = util.removeNoCacheTimeStamp(url);
                }
            } else {
                url = data.pendingModIE;
            }
        }
        if (url) {
            util.memoize(id, url, mod);
        } else {
            data.pendingMods.push(mod);
        }
    };
    function parseDependencies(code) {
        var pattern = /[^.]\brequire\s*\(\s*['"]?([^'")]*)/g;
        var ret = [],
        match;
        code = removeComments(code);
        while ((match = pattern.exec(code))) {
            if (match[1]) {
                ret.push(match[1]);
            }
        }
        return ret;
    }
    function removeComments(code) {
        return code.replace(/(?:^|\n|\r)\s*\/\*[\s\S]*?\*\/\s*(?:\r|\n|$)/g, '\n').replace(/(?:^|\n|\r)\s*\/\/.*(?:\r|\n|$)/g, '\n');
    }
})(seajs._util, seajs._data, seajs._fn); 
(function(util, data, fn) {
    function createRequire(sandbox) {
        function require(id) {
            var uri = util.id2Uri(id, sandbox.uri);
            var mod = data.memoizedMods[uri];
            if (!mod) {
                return null;
            }
            if (isCyclic(sandbox, uri)) {
                util.error({
                    message: 'found cyclic dependencies',
                    from: 'require',
                    uri: uri,
                    type: 'warn'
                });
                return mod.exports;
            }
            if (!mod.exports) {
                initExports(mod, {
                    uri: uri,
                    deps: mod.dependencies,
                    parent: sandbox
                });
            }
            return mod.exports;
        }
        require.async = function(ids, callback) {
            fn.load(ids, callback, sandbox.uri);
        };
        return require;
    }
    function initExports(mod, sandbox) {
        var ret;
        var factory = mod.factory;
        mod.id = sandbox.uri;
        mod.exports = {};
        delete mod.factory;
        delete mod.ready;
        if (util.isFunction(factory)) {
            checkPotentialErrors(factory, mod.uri);
            ret = factory(createRequire(sandbox), mod.exports, mod);
            if (ret !== undefined) {
                mod.exports = ret;
            }
        } else if (factory !== undefined) {
            mod.exports = factory;
        }
    }
    function isCyclic(sandbox, uri) {
        if (sandbox.uri === uri) {
            return true;
        }
        if (sandbox.parent) {
            return isCyclic(sandbox.parent, uri);
        }
        return false;
    }
    function checkPotentialErrors(factory, uri) {
        if (factory.toString().search(/\sexports\s*=\s*[^=]/) !== -1) {
            util.error({
                message: 'found invalid setter: exports = {...}',
                from: 'require',
                uri: uri,
                type: 'error'
            });
        }
    }
    fn.createRequire = createRequire;
})(seajs._util, seajs._data, seajs._fn); 
(function(util, data, fn, global) {
    var config = data.config;
    var loaderScript = document.getElementById('seajsnode');
    if (!loaderScript) {
        var scripts = document.getElementsByTagName('script');
        loaderScript = scripts[scripts.length - 1];
    }
    var loaderSrc = util.getScriptAbsoluteSrc(loaderScript),
    loaderDir;
    if (loaderSrc) {
        var base = loaderDir = util.dirname(loaderSrc);
        var match = base.match(/^(.+\/)seajs\/[\d\.]+\/$/);
        if (match) {
            base = match[1];
        }
        config.base = base;
    }
    config.main = loaderScript.getAttribute('data-main') || '';
    config.timeout = 20000;
    if (loaderDir && (global.location.search.indexOf('seajs-debug') !== -1 || document.cookie.indexOf('seajs=1') !== -1)) {
        config.debug = true;
        config.preload.push(loaderDir + 'plugin-map');
    }
    fn.config = function(o) {
        for (var k in o) {
            var previous = config[k];
            var current = o[k];
            if (previous && k === 'alias') {
                for (var p in current) {
                    if (current.hasOwnProperty(p)) {
                        checkConflict(previous[p], current[p]);
                        previous[p] = current[p];
                    }
                }
            } else if (previous && (k === 'map' || k === 'preload')) {
                if (!util.isArray(current)) {
                    current = [current];
                }
                util.forEach(current,
                function(item) {
                    if (item) {
                        previous.push(item);
                    }
                });
            } else {
                config[k] = current;
            }
        }
        var base = config.base;
        if (base.indexOf('://') === -1) {
            config.base = util.id2Uri(base + '#');
        }
        return this;
    };
    function checkConflict(previous, current) {
        if (previous !== undefined && previous !== current) {
            util.error({
                'message': 'config is conflicted',
                'previous': previous,
                'current': current,
                'from': 'config',
                'type': 'error'
            });
        }
    }
})(seajs._util, seajs._data, seajs._fn, this); 
(function(host, data, fn) {
    var config = data.config;
    fn.use = function(ids, callback) {
        var preloadMods = config.preload;
        var len = preloadMods.length;
        if (len) {
            fn.load(preloadMods,
            function() {
                config.preload = preloadMods.slice(len);
                fn.use(ids, callback);
            });
        } else {
			//console.log(config.preload);
            fn.load(ids, callback);
        }
    };
    var mainModuleId = config.main;
    if (mainModuleId) {
        fn.use([mainModuleId]);
    } 
	(function(args) {
        if (args) {
            var hash = {
                0 : 'config',
                1 : 'use',
                2 : 'define'
            };
            for (var i = 0; i < args.length; i += 2) {
                fn[hash[args[i]]].apply(host, args[i + 1]);
            }
            delete host._seajs;
        }
    })((host._seajs || 0)['args']);
})(seajs, seajs._data, seajs._fn); 
(function(host, data, fn, global) {
    if (host._seajs) {
        global.seajs = host._seajs;
        return;
    }
    host.config = fn.config;
    host.use = fn.use;
    var previousDefine = global.define;
    global.define = fn.define;
    host.noConflict = function(all) {
        global.seajs = host._seajs;
        if (all) {
            global.define = previousDefine;
            host.define = fn.define;
        }
        return host;
    };
    if (!data.config.debug) {
        delete host._util;
        delete host._data;
        delete host._fn;
        delete host._seajs;
    }
})(seajs, seajs._data, seajs._fn, this);
window.define = function(define) {
    define._____ids = define._____ids || {};
    return function(id) {
        if (arguments.length >= 3 && typeof id === 'string' && define._____ids[id]) {
            return;
        }
        typeof id === 'string' && (define._____ids[id] = true);
        return define.apply(this, arguments);
    }
} (define);
/*  |xGv00|cc41e58e14d5312cf1e7a57331f60d54 */
