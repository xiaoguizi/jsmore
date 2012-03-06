(function() {
    window.FM = window.FM || {};
    window.MUSIC = window.MUSIC || {};
    FM.miniMusic = FM.miniMusic || {};
    FM.$ = function(e) {
        if (typeof e == 'string') {
            e = document.getElementById(e);
        }
        return e;
    }
    FM.getDomain = function() {
        var s = window.location.host.split("."),
        domain = "qq.com";
        if (s.length > 1) {
            domain = s.slice(s.length - 2).join(".");
        } else {
            domain = "qq.com";
        }
        return domain;
    };
    FM.isPengyou = (FM.getDomain() == "pengyou.com" ? true: false);
    FM.domain = {
        "portalcgi.music.qq.com": (FM.isPengyou ? "portalcgi.music.pengyou.com": "portalcgi.music.qq.com"),
        "radio.cloud.music.qq.com": (FM.isPengyou ? "radio.cloud.music.pengyou.com": "radio.cloud.music.qq.com"),
        "qzone-music.qq.com": (FM.isPengyou ? "qzone.music.pengyou.com": "qzone-music.qq.com"),
        "music.qq.com": (FM.isPengyou ? "music.pengyou.com": "music.qq.com"),
        "s.plcloud.music.qq.com": (FM.isPengyou ? "s.plcloud.music.pengyou.com": "s.plcloud.music.qq.com")
    };
    FM.emptyFn = function() {};
    FM.returnFn = function(v) {
        return v;
    }; (function() {
        var ua = FM.userAgent = {},
        agent = navigator.userAgent,
        nv = navigator.appVersion,
        r, m, optmz;
        ua.adjustBehaviors = FM.emptyFn;
        if (window.ActiveXObject) {
            ua.ie = 9 - ((agent.indexOf('Trident/5.0') > -1) ? 0 : 1) - (window.XDomainRequest ? 0 : 1) - (window.XMLHttpRequest ? 0 : 1);
            FM._doc = document;
            optmz = function(st) {
                return function(fns, tm) {
                    var aargs;
                    if (typeof fns == 'string') {
                        return st(fns, tm);
                    } else {
                        aargs = Array.prototype.slice.call(arguments, 2);
                        return st(function() {
                            fns.apply(null, aargs);
                        },
                        tm);
                    }
                };
            };
            window.setTimeout = FM._setTimeout = optmz(window.setTimeout);
            window.setInterval = FM._setInterval = optmz(window.setInterval);
        } else if (document.getBoxObjectFor || typeof(window.mozInnerScreenX) != 'undefined') {
            r = /(?:Firefox|GranParadiso|Iceweasel|Minefield).(\d+\.\d+)/i;
            ua.firefox = parseFloat((r.exec(agent) || r.exec('Firefox/3.3'))[1], 10);
        } else if (!navigator.taintEnabled) {
            m = /AppleWebKit.(\d+\.\d+)/i.exec(agent);
            ua.webkit = m ? parseFloat(m[1], 10) : (document.evaluate ? (document.querySelector ? 525 : 420) : 419);
            if ((m = /Chrome.(\d+\.\d+)/i.exec(agent)) || window.chrome) {
                ua.chrome = m ? parseFloat(m[1], 10) : '2.0';
            } else if ((m = /Version.(\d+\.\d+)/i.exec(agent)) || window.safariHandler) {
                ua.safari = m ? parseFloat(m[1], 10) : '3.3';
            }
            ua.air = agent.indexOf('AdobeAIR') > -1 ? 1 : 0;
            ua.isiPad = agent.indexOf('iPad') > -1;
            ua.isiPhone = agent.indexOf('iPhone') > -1;
        } else if (window.opera) {
            ua.opera = parseFloat(window.opera.version(), 10);
        } else {
            ua.ie = 6;
        }
        if (! (ua.macs = agent.indexOf('Mac OS X') > -1)) {
            ua.windows = ((m = /Windows.+?(\d+\.\d+)/i.exec(agent)), m && parseFloat(m[1], 10));
            ua.linux = agent.indexOf('Linux') > -1;
        }
    })();
    var ua = FM.userAgent;
    FM.object = {
        map: function(object, scope) {
            return FM.object.extend(scope || window, object);
        },
        extend: function() {
            var args = arguments,
            len = arguments.length,
            deep = false,
            i = 1,
            target = args[0],
            opts,
            src,
            clone,
            copy;
            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }
            if (typeof target !== "object" && typeof target !== "function") {
                target = {};
            }
            if (len === i) {
                target = FM; --i;
            }
            for (; i < len; i++) {
                if ((opts = arguments[i]) != null) {
                    for (var name in opts) {
                        src = target[name];
                        copy = opts[name];
                        if (target === copy) {
                            continue;
                        }
                        if (deep && copy && typeof copy === "object" && !copy.nodeType) {
                            if (src) {
                                clone = src;
                            } else if (FM.lang.isArray(copy)) {
                                clone = [];
                            } else if (FM.object.getType(copy) === 'object') {
                                clone = {};
                            } else {
                                clone = copy;
                            }
                            target[name] = FM.object.extend(deep, clone, copy);
                        } else if (copy !== undefined) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        },
        each: function(obj, callback) {
            var value, i = 0,
            length = obj.length,
            isObj = (length === undefined) || (typeof(obj) == "function");
            if (isObj) {
                for (var name in obj) {
                    if (callback.call(obj[name], obj[name], name, obj) === false) {
                        break;
                    }
                }
            } else {
                for (value = obj[0]; i < length && false !== callback.call(value, value, i, obj); value = obj[++i]) {}
            }
            return obj;
        },
        getType: function(obj) {
            return obj === null ? 'null': (obj === undefined ? 'undefined': Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
        },
        routeRE: /([\d\w_]+)/g,
        route: function(obj, path) {
            obj = obj || {};
            path = String(path);
            var r = FM.object.routeRE,
            m;
            r.lastIndex = 0;
            while ((m = r.exec(path)) !== null) {
                obj = obj[m[0]];
                if (obj === undefined || obj === null) {
                    break;
                }
            }
            return obj;
        },
        bind: function(obj, fn) {
            var slice = Array.prototype.slice,
            args = slice.call(arguments, 2);
            return function() {
                obj = obj || this;
                fn = typeof fn == 'string' ? obj[fn] : fn;
                fn = typeof fn == 'function' ? fn: FM.emptyFn;
                return fn.apply(obj, args.concat(slice.call(arguments, 0)));
            };
        },
        ease: function(src, tar, rule) {
            if (tar) {
                if (typeof(rule) != 'function') {
                    rule = FM.object._eachFn;
                }
                FM.object.each(src,
                function(v, k) {
                    if (typeof(v) == 'function') {
                        tar[rule(k)] = v;
                    }
                });
            }
        },
        _easeFn: function(name) {
            return '$' + name;
        }
    };
    FM.namespace = FM.object;
    FM.lang = FM.lang || {
        isString: function(o) {
            return (typeof(o) != 'undefined') && (o !== null) && (typeof(o) == 'string');
        },
        isArray: function(o) {
            return (Object.prototype.toString.apply(o) === '[object Array]');
        },
        getType: function(obj) {
            return obj === null ? 'null': (obj === undefined ? 'undefined': Object.prototype.toString.call(obj).slice(8, -1).toLowerCase());
        },
        isHashMap: function(o) {
            return ((o !== null) && (typeof(o) == 'object'));
        },
        isElement: function(o) {
            return o && o.nodeType == 1;
        },
        arg2arr: function(refArgs, start) {
            if (typeof start == 'undefined') {
                start = 0;
            }
            return Array.prototype.slice.apply(refArgs, [start, refArgs.length]);
        }
    };
    FM.console = {
        print: function() {
            try {
                if ( !! FM.userAgent.ie) {
                    window.console && console.log(([].slice.call(arguments)).join('\t'));
                } else {
                    window.console && console.log(arguments);
                }
            } catch(e) {}
        }
    }
    FM.media = {
        _flashVersion: null,
        getFlashHtml: function(flashArguments, requiredVersion, flashPlayerCID) {
            var _attrs = [],
            _params = [];
            for (var k in flashArguments) {
                switch (k) {
                case "noSrc":
                case "movie":
                    continue;
                    break;
                case "id":
                case "name":
                case "width":
                case "height":
                case "style":
                    if (typeof(flashArguments[k]) != 'undefined') {
                        _attrs.push(' ', k, '="', flashArguments[k], '"');
                    }
                    break;
                case "src":
                    if (FM.userAgent.ie) {
                        _params.push('<param name="movie" value="', (flashArguments.noSrc ? "": flashArguments[k]), '"/>');
                    } else {
                        _attrs.push(' data="', (flashArguments.noSrc ? "": flashArguments[k]), '"');
                    }
                    break;
                default:
                    _params.push('<param name="', k, '" value="', flashArguments[k], '" />');
                }
            }
            if (FM.userAgent.ie) {
                _attrs.push(' classid="clsid:', flashPlayerCID || 'D27CDB6E-AE6D-11cf-96B8-444553540000', '"');
            } else {
                _attrs.push(' type="application/x-shockwave-flash"');
            }
            if (requiredVersion && (requiredVersion instanceof FM.media.SWFVersion)) {
                _attrs.push(' codeBase="http://fpdownload.macromedia.com/get/flashplayer/current/swflash.cab#version=', requiredVersion, '"');
            }
            return "<object" + _attrs.join("") + ">" + _params.join("") + "</object>";
        }
    };
    FM.media.SWFVersion = function() {
        var a;
        if (arguments.length > 1) {
            a = arg2arr(arguments);
        } else if (arguments.length == 1) {
            if (typeof(arguments[0]) == "object") {
                a = arguments[0];
            } else if (typeof arguments[0] == 'number') {
                a = [arguments[0]];
            } else {
                a = [];
            }
        } else {
            a = [];
        }
        this.major = parseInt(a[0], 10) || 0;
        this.minor = parseInt(a[1], 10) || 0;
        this.rev = parseInt(a[2], 10) || 0;
        this.add = parseInt(a[3], 10) || 0;
    };
    FM.string = {
        RegExps: {
            trim: /^\s+|\s+$/g,
            ltrim: /^\s+/,
            rtrim: /\s+$/,
            nl2br: /\n/g,
            s2nb: /[\x20]{2}/g,
            URIencode: /[\x09\x0A\x0D\x20\x21-\x29\x2B\x2C\x2F\x3A-\x3F\x5B-\x5E\x60\x7B-\x7E]/g,
            escHTML: {
                re_amp: /&/g,
                re_lt: /</g,
                re_gt: />/g,
                re_apos: /\x27/g,
                re_quot: /\x22/g
            },
            escString: {
                bsls: /\\/g,
                nl: /\n/g,
                rt: /\r/g,
                tab: /\t/g
            },
            restXHTML: {
                re_amp: /&amp;/g,
                re_lt: /&lt;/g,
                re_gt: /&gt;/g,
                re_apos: /&(?:apos|#0?39);/g,
                re_quot: /&quot;/g
            },
            write: /\{(\d{1,2})(?:\:([xodQqb]))?\}/g,
            isURL: /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i,
            cut: /[\x00-\xFF]/,
            getRealLen: {
                r0: /[^\x00-\xFF]/g,
                r1: /[\x00-\xFF]/g
            },
            format: /\{([\d\w\.]+)\}/g
        },
        commonReplace: function(s, p, r) {
            return s.replace(p, r);
        },
        listReplace: function(s, l) {
            if (FM.lang.isHashMap(l)) {
                for (var i in l) {
                    s = FM.string.commonReplace(s, l[i], i);
                }
                return s;
            } else {
                return s + '';
            }
        },
        escString: function(str) {
            var t = FM.string.RegExps.escString,
            h = FM.string.RegExps.escHTML;
            return FM.string.listReplace((str + ""), {
                '\\\\': t.bsls,
                '\\n': t.nl,
                '': t.rt,
                '\\t': t.tab,
                '\\\'': h.re_apos,
                '\\"': h.re_quot
            });
        }
    };
    FM.trim = function(s) {
        return s.replace(/^\s+|\s+$/, "");
    }
    String.prototype.entityReplace = function() {
        return this.replace(/&#38;?/g, "&amp;").replace(/&amp;/g, "&").replace(/&#(\d+);?/g,
        function(a, b) {
            return String.fromCharCode(b)
        }).replace(/′/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&acute;/gi, "'").replace(/&nbsp;/g, " ").replace(/&#13;/g, "\n").replace(/(&#10;)|(&#x\w*;)/g, "").replace(/&amp;/g, "&");
    }
    String.prototype.myEncode = function() {
        return this.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\\/, "＼").replace(/\'/g, "’").replace(/\"/g, "“").replace(/&#39;/g, "’").replace(/&quot;/g, "“").replace(/&acute;/g, "’").replace(/\%/g, "％").replace(/\(/g, "（").replace(/\)/g, "）");
    }
    FM.event = MUSIC.event = {
        KEYS: {
            BACKSPACE: 8,
            TAB: 9,
            RETURN: 13,
            ESC: 27,
            SPACE: 32,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40,
            DELETE: 46
        },
        extendType: /(click|mousedown|mouseover|mouseout|mouseup|mousemove|scroll|contextmenu|resize)/i,
        _eventListDictionary: {},
        _fnSeqUID: 0,
        _objSeqUID: 0,
        addEvent: function(obj, eventType, fn, argArray) {
            var cfn = fn,
            res = false,
            l;
            if (!obj) {
                return res;
            }
            if (!obj.eventsListUID) {
                obj.eventsListUID = "e" + (++FM.event._objSeqUID);
            }
            if (! (l = FM.event._eventListDictionary[obj.eventsListUID])) {
                l = FM.event._eventListDictionary[obj.eventsListUID] = {};
            }
            if (!fn.__elUID) {
                fn.__elUID = "e" + (++FM.event._fnSeqUID) + obj.eventsListUID;
            }
            if (!l[eventType]) {
                l[eventType] = {};
            }
            if (typeof(l[eventType][fn.__elUID]) == 'function') {
                return false;
            }
            cfn = function(evt) {
                return fn.apply(obj, !argArray ? [FM.event.getEvent(evt)] : ([FM.event.getEvent(evt)]).concat(argArray));
            };
            if (obj.addEventListener) {
                obj.addEventListener(eventType, cfn, false);
                res = true;
            } else if (obj.attachEvent) {
                res = obj.attachEvent("on" + eventType, cfn);
            } else {
                res = false;
            }
            if (res) {
                l[eventType][fn.__elUID] = cfn;
            }
            return res;
        },
        removeEvent: function(obj, eventType, fn) {
            var cfn = fn,
            res = false,
            l = FM.event._eventListDictionary,
            r;
            if (!obj) {
                return res;
            }
            if (!fn) {
                return FM.event.purgeEvent(obj, eventType);
            }
            if (obj.eventsListUID && l[obj.eventsListUID]) {
                l = l[obj.eventsListUID][eventType];
                if (l && l[fn.__elUID]) {
                    cfn = l[fn.__elUID];
                    r = l;
                }
            }
            if (obj.removeEventListener) {
                obj.removeEventListener(eventType, cfn, false);
                res = true;
            } else if (obj.detachEvent) {
                obj.detachEvent("on" + eventType, cfn);
                res = true;
            } else {
                return false;
            }
            if (res && r && r[fn.__elUID]) {
                delete r[fn.__elUID];
            }
            return res;
        },
        purgeEvent: function(obj, type) {
            var l;
            if (obj.eventsListUID && (l = FM.event._eventListDictionary[obj.eventsListUID]) && l[type]) {
                for (var k in l[type]) {
                    if (obj.removeEventListener) {
                        obj.removeEventListener(type, l[type][k], false);
                    } else if (obj.detachEvent) {
                        obj.detachEvent('on' + type, l[type][k]);
                    }
                }
            }
            if (obj['on' + type]) {
                obj['on' + type] = null;
            }
            if (l) {
                l[type] = null;
                delete l[type];
            }
            return true;
        },
        getEvent: function(evt) {
            var evt = window.event || evt || null,
            c, _s = FM.event.getEvent,
            ct = 0;
            if (!evt) {
                c = arguments.callee;
                while (c && ct < _s.MAX_LEVEL) {
                    if ((evt = c.arguments[0]) && (typeof(evt.button) != "undefined" && typeof(evt.ctrlKey) != "undefined")) {
                        break;
                    }++ct;
                    c = c.caller;
                }
            }
            return evt;
        },
        getTarget: function(evt) {
            var e = FM.event.getEvent(evt);
            if (e) {
                return e.srcElement || e.target;
            } else {
                return null;
            }
        },
        getCurrentTarget: function(evt) {
            var e = FM.event.getEvent(evt);
            if (e) {
                return e.currentTarget || document.activeElement;
            } else {
                return null;
            }
        },
        cancelBubble: function(evt) {
            evt = FM.event.getEvent(evt);
            if (!evt) {
                return false;
            }
            if (evt.stopPropagation) {
                evt.stopPropagation();
            } else {
                if (!evt.cancelBubble) {
                    evt.cancelBubble = true;
                }
            }
        },
        preventDefault: function(evt) {
            evt = FM.event.getEvent(evt);
            if (!evt) {
                return false;
            }
            if (evt.preventDefault) {
                evt.preventDefault();
            } else {
                evt.returnValue = false;
            }
        },
        mouseX: function(evt) {
            evt = FM.event.getEvent(evt);
            return evt.pageX || (evt.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
        },
        mouseY: function(evt) {
            evt = FM.event.getEvent(evt);
            return evt.pageY || (evt.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
        },
        bind: function(obj, method) {
            var args = Array.prototype.slice.call(arguments, 2);
            return function() {
                var _obj = obj || this;
                var _args = args.concat(Array.prototype.slice.call(arguments, 0));
                if (typeof(method) == "string") {
                    if (_obj[method]) {
                        return _obj[method].apply(_obj, _args);
                    }
                } else {
                    return method.apply(_obj, _args);
                }
            }
        },
        onDomReady: function(onready) {
            var enableMozDOMReady = true,
            isReady = false;
            function doReady() {
                if (isReady) {
                    return;
                }
                isReady = true;
                onready();
            }
            if ( !! ua.ie) { (function() {
                    if (isReady) {
                        return;
                    }
                    try {
                        document.documentElement.doScroll("left");
                        if (document.documentElement.childNodes.length < 2) {
                            throw "not loaded";
                        }
                    } catch(error) {
                        setTimeout(arguments.callee, 0);
                        return;
                    }
                    doReady();
                })();
                window.attachEvent('onload', doReady);
            } else if ( !! ua.webkit && ua.webkit < 525) { (function() {
                    if (isReady) {
                        return;
                    }
                    if (/loaded|complete/.test(document.readyState)) {
                        doReady();
                    } else {
                        setTimeout(arguments.callee, 0);
                    }
                })();
                window.addEventListener('load', doReady, false);
            } else {
                if (!ua.firefox || ua.firefox != 2 || enableMozDOMReady) {
                    document.addEventListener("DOMContentLoaded",
                    function() {
                        document.removeEventListener("DOMContentLoaded", arguments.callee, false);
                        doReady();
                    },
                    false);
                }
                window.addEventListener('load', doReady, false);
            }
        }
    };
    FM.event.getEvent.MAX_LEVEL = 10;
    function EventUtil(oTarget, sEventType, fnHandler) {
        FM.event.addEvent(oTarget, sEventType, fnHandler);
    }
    function EventUtilRemove(oTarget, sEventType, fnHandler) {
        FM.event.removeEvent(oTarget, sEventType, fnHandler);
    };
    FM.css = FM.css || {
        styleSheets: {},
        insertCSSLink: function(url, id, sco) {
            var dom = document;
            if (sco != null) {
                var dom = sco.document;
            }
            if (id != null && dom.getElementById(id) != null) {
                return;
            }
            var cssLink = dom.createElement("link");
            if (id) {
                cssLink.id = id;
            }
            cssLink.rel = "stylesheet";
            cssLink.rev = "stylesheet";
            cssLink.type = "text/css";
            cssLink.media = "screen";
            cssLink.href = url;
            dom.getElementsByTagName("head")[0].appendChild(cssLink);
            return cssLink.sheet || cssLink;
        },
        hasClassName: function(elem, cname) {
            return (elem && cname) ? new RegExp('\\b' + FM.trim(cname) + '\\b').test(elem.className) : false;
        },
        addClassName: function(elem, cname) {
            if (elem && cname) {
                if (elem.className) {
                    if (FM.css.hasClassName(elem, cname)) {
                        return false;
                    } else {
                        elem.className += ' ' + FM.trim(cname);
                        return true;
                    }
                } else {
                    elem.className = cname;
                    return true;
                }
            } else {
                return false;
            }
        },
        removeClassName: function(elem, cname) {
            if (elem && cname && elem.className) {
                var old = elem.className;
                elem.className = FM.trim(elem.className.replace(new RegExp('\\b' + FM.trim(cname) + '\\b'), ''));
                return elem.className != old;
            } else {
                return false;
            }
        }
    }
    FM.css.insertCSSLink("http://imgcache.qq.com/mediastyle/app/fm_player/fm_player.css");
    FM.dom = MUSIC.dom = {
        getById: function(e) {
            return (typeof e == 'string') ? document.getElementById(e) : e;
        },
        getNode: function(e) {
            if (e && (e.nodeType || e.item)) {
                return e;
            }
            if (typeof e === 'string') {
                return this.getById(e);
            }
            return null;
        },
        get: function(e) {
            return this.getNode(e);
        },
        getStyle: function(el, property) {
            el = FM.dom.get(el);
            if (!el || el.nodeType == 9) {
                return null;
            }
            var w3cMode = document.defaultView && document.defaultView.getComputedStyle,
            computed = !w3cMode ? null: document.defaultView.getComputedStyle(el, ''),
            value = "";
            switch (property) {
            case "float":
                property = w3cMode ? "cssFloat": "styleFloat";
                break;
            case "opacity":
                if (!w3cMode) {
                    var val = 100;
                    try {
                        val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                    } catch(e) {
                        try {
                            val = el.filters('alpha').opacity;
                        } catch(e) {}
                    }
                    return val / 100;
                } else {
                    return parseFloat((computed || el.style)[property]);
                }
                break;
            case "backgroundPositionX":
                if (w3cMode) {
                    property = "backgroundPosition";
                    return ((computed || el.style)[property]).split(" ")[0];
                }
                break;
            case "backgroundPositionY":
                if (w3cMode) {
                    property = "backgroundPosition";
                    return ((computed || el.style)[property]).split(" ")[1];
                }
                break;
            }
            if (w3cMode) {
                return (computed || el.style)[property];
            } else {
                return (el.currentStyle[property] || el.style[property]);
            }
        },
        setStyle: function(el, properties, value) {
            if (! (el = FM.dom.get(el)) || el.nodeType != 1) {
                return false;
            }
            var tmp, bRtn = true,
            w3cMode = (tmp = document.defaultView) && tmp.getComputedStyle,
            rexclude = /z-?index|font-?weight|opacity|zoom|line-?height/i;
            if (typeof(properties) == 'string') {
                tmp = properties;
                properties = {};
                properties[tmp] = value;
            }
            for (var prop in properties) {
                value = properties[prop];
                if (prop == 'float') {
                    prop = w3cMode ? "cssFloat": "styleFloat";
                } else if (prop == 'opacity') {
                    if (!w3cMode) {
                        prop = 'filter';
                        value = value >= 1 ? '': ('alpha(opacity=' + Math.round(value * 100) + ')');
                    }
                } else if (prop == 'backgroundPositionX' || prop == 'backgroundPositionY') {
                    tmp = prop.slice( - 1) == 'X' ? 'Y': 'X';
                    if (w3cMode) {
                        var v = FM.dom.getStyle(el, "backgroundPosition" + tmp);
                        prop = 'backgroundPosition';
                        typeof(value) == 'number' && (value = value + 'px');
                        value = tmp == 'Y' ? (value + " " + (v || "top")) : ((v || 'left') + " " + value);
                    }
                }
                if (typeof el.style[prop] != "undefined") {
                    el.style[prop] = value + (typeof value === "number" && !rexclude.test(prop) ? 'px': '');
                    bRtn = bRtn && true;
                } else {
                    bRtn = bRtn && false;
                }
            }
            return bRtn;
        },
        getXY: function(elem, doc) {
            var box = FM.dom.getPosition(elem) || {
                left: 0,
                top: 0
            };
            return [box.left, box.top];
        },
        setXY: function(elem, x, y) {
            var _ml = parseInt(FM.dom.getStyle(elem, "marginLeft")) || 0,
            _mt = parseInt(FM.dom.getStyle(elem, "marginTop")) || 0;
            FM.dom.setStyle(elem, {
                left: (parseInt(x) || 0) - _ml + "px",
                top: (parseInt(y) || 0) - _mt + "px"
            });
        },
        getRect: function(elem) {
            if (elem = FM.dom.get(elem)) {
                var box = {};
                try {
                    box = FM.object.extend({},
                    elem.getBoundingClientRect());
                    if (typeof box.width == 'undefined') {
                        box.width = box.right - box.left;
                        box.height = box.bottom - box.top;
                    }
                } catch(e) {
                    box = {
                        left: 0,
                        right: 0,
                        width: 0,
                        height: 0,
                        bottom: 0,
                        top: 0
                    };
                }
                return box;
            }
        },
        getPosition: function(elem) {
            var box, s, doc;
            if (box = FM.dom.getRect(elem)) {
                if (s = FM.dom.getScrollLeft(doc = elem.ownerDocument)) {
                    box.left += s,
                    box.right += s;
                }
                if (s = FM.dom.getScrollTop(doc)) {
                    box.top += s,
                    box.bottom += s;
                }
                return box;
            }
        },
        getSize: function(elem) {
            var box = FM.dom.getPosition(elem) || {
                width: -1,
                height: -1
            };
            return [box.width, box.height];
        },
        getScrollLeft: function(doc) {
            var _doc = doc || document;
            return Math.max(_doc.documentElement.scrollLeft, _doc.body.scrollLeft);
        },
        getScrollTop: function(doc) {
            var _doc = doc || document;
            return Math.max(_doc.documentElement.scrollTop, _doc.body.scrollTop);
        },
        getFirstChild: function(node) {
            node = this.getNode(node);
            if (!node) {
                return null;
            }
            var child = FM.lang.isElement(node.firstChild) ? node.firstChild: null;
            return child || this.getNextSibling(node.firstChild);
        },
        getNextSibling: function(node) {
            node = this.getNode(node);
            if (!node) {
                return null;
            }
            while (node) {
                node = node.nextSibling;
                if (FM.lang.isElement(node)) {
                    return node;
                }
            }
            return null;
        },
        removeElement: function(el) {
            if (!el) {
                return;
            }
            if (el.removeNode) {
                el.removeNode(true);
            } else {
                if (el.childNodes.length > 0) {
                    for (var ii = el.childNodes.length - 1; ii >= 0; ii--) {
                        FM.dom.removeElement(el.childNodes[ii]);
                    }
                }
                if (el.parentNode) {
                    el.parentNode.removeChild(el);
                }
            }
            el = null;
            return null;
        },
        createNamedElement: function(type, name, doc) {
            doc = doc || document;
            var element;
            try {
                element = doc.createElement('<' + type + ' name="' + name + '">');
            } catch(ignore) {}
            if (!element || !element.name) {
                element = doc.createElement(type);
                element.name = name;
            }
            return element;
        },
        hideElement: function(e) {
            try {
                FM.$(e).style.display = "none";
            } catch(Ignore) {}
        },
        showElement: function(e) {
            try {
                FM.$(e).style.display = "";
            } catch(e) {}
        }
    }; (function(w) {
        w.ua = FM.userAgent;
        w.removeNode = FM.dom.removeElement;
    })(window); (function() {
        if ( !! ua) {
            ua.tt = (function() {
                var vtt = NaN;
                var agent = (/(?:(?:TencentTraveler|QQBrowser).(\d+\.\d+))/).exec(navigator.userAgent);
                if (agent) {
                    vtt = agent[1] ? parseFloat(agent[1]).toFixed(2) : NaN;
                } else {
                    vtt = NaN;
                }
                return vtt;
            })();
            try {
                var tv = ua.tt.split(".");
                ua.ttHtml5Audio = (((tv[0] == 6 && tv[1] >= 8) || tv[0] >= 7) && !!ua.chrome);
            } catch(e) {
                ua.ttHtml5Audio = false;
            }
        }
    })();
    FM.compareVer = function(v1, v2) {
        try {
            tv1 = v1.split(".");
            tv2 = v2.split(".");
            var d = 0;
            for (var i = 0,
            l1 = tv1.length,
            l2 = tv2.length; i < l1 && i < l2; i++) {
                d = parseInt(tv1[i], 10) - parseInt(tv2[i], 10);
                if (d > 0) {
                    return 1;
                } else if (d < 0) {
                    return - 1;
                } else {
                    continue;
                }
            }
            return 0;
        } catch(e) {
            return - 2;
        }
    }
    FM.JsLoader = function() {
        this.loaded = false;
        this.debug = true;
        this.onload = FM.emptyFn;
        this.onerror = FM.emptyFn;
    }
    FM.JsLoader.scriptId = 1;
    FM.JsLoader.prototype.load = function(src, doc, charset) {
        var sId = FM.JsLoader.scriptId;
        FM.JsLoader.scriptId++;
        var o = this;
        setTimeout(function() {
            o._load2.apply(o, [sId, src, doc, charset]);
            o = null;
        },
        0);
    }
    FM.JsLoader.prototype._load2 = function(sId, src, doc, charset) {
        _doc = doc || document;
        charset = charset || "gb2312";
        var _ie = FM.userAgent.ie;
        var _js = _doc.createElement("script");
        FM.event.addEvent(_js, (_ie ? "readystatechange": "load"), (function(o) {
            if (_ie) {
                return (function() {
                    if (/(complete|loaded)/.test(_js.readyState)) {
                        o.onload();
                        if (!o.debug) {
                            FM.dom.removeElement(_js);
                        }
                        _js = null;
                    }
                });
            } else {
                return (function() {
                    o.onload();
                    if (!o.debug) {
                        FM.dom.removeElement(_js);
                    }
                    _js = null;
                });
            }
        })(this));
        if (!_ie) {
            FM.event.addEvent(_js, "error", (function(o) {
                return (function() {
                    o.onerror();
                    if (!o.debug) {
                        FM.dom.removeElement(_js);
                    }
                    _js = null;
                });
            })(this));
        }
        _js.id = "js_" + sId;
        _js.defer = true;
        _js.charset = charset;
        _js.src = src;
        _doc.getElementsByTagName("head")[0].appendChild(_js);
    }
    FM["js" + "Loader"] = FM.JsLoader;
    function includeJS(src, option, _doc, charset) {
        charset = charset || "GB2312";
        var s = new FM.JsLoader();
        if (typeof(option) == 'function') s.onload = option;
        s.load(src, _doc, charset);
    }
    FM.JSONGetter = function(actionURL, cname, data, charset, junctionMode) {
        if (FM.lang.getType(cname) != "string") {
            cname = "_jsonInstence_" + (FM.JSONGetter.counter + 1);
        }
        var prot = FM.JSONGetter.instance[cname];
        if (prot instanceof FM.JSONGetter) {} else {
            FM.JSONGetter.instance[cname] = prot = this;
            FM.JSONGetter.counter++;
            prot._name = cname;
            prot._sender = null;
            prot._timer = null;
            this.onSuccess = FM.emptyFn;
            this.onError = FM.emptyFn;
            this.onTimeout = FM.emptyFn;
            this.timeout = 5000;
            this.clear = FM.emptyFn;
            this._baseClear = function() {
                this._waiting = false;
                this._squeue = [];
                this._equeue = [];
                this.onSuccess = this.onError = FM.emptyFn;
                this.clear = null;
            };
        }
        prot._uri = actionURL;
        prot._data = (data && (FM.lang.getType(data) == "object" || FM.lang.getType(data) == "string")) ? data: null;
        prot._charset = (FM.lang.getType(charset) != 'string') ? FM.config.defaultDataCharacterSet: charset;
        prot._jMode = !!junctionMode;
        return prot;
    };
    FM.JSONGetter.instance = {};
    FM.JSONGetter.counter = 0;
    FM.JSONGetter._errCodeMap = {
        999 : {
            msg: 'Connection or Server error.'
        },
        998 : {
            msg: 'Connection to Server timeout.'
        }
    };
    FM.JSONGetter.genHttpParamString = function(o) {
        var r = [];
        for (var i in o) {
            r.push(i + "=" + encodeURIComponent(o[i]));
        }
        return r.join("&");
    };
    FM.JSONGetter.prototype.addOnSuccess = function(f) {
        if (typeof(f) == "function") {
            if (this._squeue && this._squeue.push) {} else {
                this._squeue = [];
            }
            this._squeue.push(f);
        }
    };
    FM.JSONGetter._runFnQueue = function(q, resultArgs, th) {
        var f;
        if (q && q.length) {
            while (q.length > 0) {
                f = q.shift();
                if (typeof(f) == "function") {
                    f.apply(th ? th: null, resultArgs);
                }
            }
        }
    };
    FM.JSONGetter.prototype.addOnError = function(f) {
        if (typeof(f) == "function") {
            if (this._equeue && this._equeue.push) {} else {
                this._equeue = [];
            }
            this._equeue.push(f);
        }
    };
    FM.JSONGetter.pluginsPool = {
        "srcStringHandler": []
    };
    FM.JSONGetter._pluginsRunner = function(pType, data) {
        var _s = FM.JSONGetter,
        l = _s.pluginsPool[pType],
        t = data,
        len;
        if (l && (len = l.length)) {
            for (var i = 0; i < len; ++i) {
                if (typeof(l[i]) == "function") {
                    t = l[i](t);
                }
            }
        }
        return t;
    };
    FM.JSONGetter.prototype.send = function(callbackFnName) {
        if (this._waiting) {
            return;
        }
        var cfn = (FM.lang.getType(callbackFnName) != 'string') ? "callback": callbackFnName,
        clear,
        da = this._uri;
        if (this._data) {
            da += (da.indexOf("?") < 0 ? "?": "&") + ((typeof(this._data) == "object") ? FM.JSONGetter.genHttpParamString(this._data) : this._data);
        }
        da = FM.JSONGetter._pluginsRunner("srcStringHandler", da);
        if (da == "") {
            return;
        }
        if (this._jMode) {
            window[cfn] = this.onSuccess;
            var _sd = new FM.JsLoader();
            _sd.onerror = this.onError;
            _sd.load(da, void(0), this._charset);
            return;
        }
        this._timer = setTimeout((function(th) {
            return function() {
                th.onTimeout();
            };
        })(this), this.timeout);
        if (ua.ie) {
            if (ua.beta && navigator.appVersion.indexOf("Trident\/4.0") > -1) {
                var _hf = new ActiveXObject("htmlfile");
                this.clear = clear = function(o) {
                    clearTimeout(o._timer);
                    if (o._sender) {
                        o._sender.close();
                        o._sender.parentWindow[cfn] = o._sender.parentWindow["errorCallback"] = null;
                        o._sender = null;
                    }
                    o._baseClear();
                };
                this._sender = _hf;
                var _cb = (function(th) {
                    return (function() {
                        setTimeout((function(_o, _a) {
                            return (function() {
                                th._waiting = false;
                                _o.onSuccess.apply(_o, _a);
                                FM.JSONGetter._runFnQueue(th._squeue, _a, th);
                                clear(_o);
                            })
                        })(th, arguments), 0);
                    });
                })(this);
                var _ecb = (function(th) {
                    return (function() {
                        th._waiting = false;
                        var _eo = FM.JSONGetter._errCodeMap[999];
                        th.onError(_eo);
                        FM.JSONGetter._runFnQueue(th._equeue, [_eo], th);
                        clear(th);
                    });
                })(this);
                _hf.open();
                _hf.parentWindow[cfn] = function() {
                    _cb.apply(null, arguments);
                };
                _hf.parentWindow["errorCallback"] = _ecb;
                this._waiting = true;
                _hf.write("<script src=\"" + da + "\" charset=\"" + this._charset + "\"><\/script><script defer>setTimeout(\"try{errorCallback();}catch(ign){}\",0)<\/script>");
            } else {
                var df = document.createDocumentFragment(),
                sender = (ua.ie == 9 ? document: df).createElement("script");
                sender.charset = this._charset;
                this._senderDoc = df;
                this._sender = sender;
                this.clear = clear = function(o) {
                    clearTimeout(o._timer);
                    if (o._sender) {
                        o._sender.onreadystatechange = null;
                    }
                    df = o._senderDoc = o._sender = null;
                    o._baseClear();
                };
                df[cfn] = (function(th) {
                    return (function() {
                        th._waiting = false;
                        th.onSuccess.apply(th, arguments);
                        FM.JSONGetter._runFnQueue(th._squeue, arguments, th);
                        clear(th);
                    });
                })(this);
                sender.onreadystatechange = (function(th) {
                    return (function() {
                        if (th._sender && th._sender.readyState == "loaded") {
                            try {
                                th._waiting = false;
                                var _eo = FM.JSONGetter._errCodeMap[999];
                                th.onError(_eo);
                                FM.JSONGetter._runFnQueue(th._equeue, [_eo], th);
                                clear(th);
                            } catch(ignore) {}
                        }
                    });
                })(this);
                this._waiting = true;
                df.appendChild(sender);
                this._sender.src = da;
            }
        } else {
            this.clear = clear = function(o) {
                clearTimeout(o._timer);
                if (o._sender) {
                    o._sender.src = "about:blank";
                    o._sender = o._sender.callback = o._sender.errorCallback = null;
                }
                if (ua.safari || ua.opera) {
                    setTimeout('FM.dom.removeElement(FM.$("_JSON_frm_' + o._name + '"))', 50);
                } else {
                    FM.dom.removeElement(FM.$("_JSON_frm_" + o._name));
                }
                o._baseClear();
            };
            var _cb = (function(th) {
                return (function() {
                    th._waiting = false;
                    th.onSuccess.apply(th, arguments);
                    FM.JSONGetter._runFnQueue(th._squeue, arguments, th);
                    clear(th);
                });
            })(this);
            var _ecb = (function(th) {
                return (function() {
                    th._waiting = false;
                    var _eo = FM.JSONGetter._errCodeMap[999];
                    th.onError(_eo);
                    FM.JSONGetter._runFnQueue(th._equeue, [_eo], th);
                    clear(th);
                });
            })(this);
            var frm = document.createElement("iframe");
            frm.id = "_JSON_frm_" + this._name;
            frm.style.width = frm.style.height = frm.style.borderWidth = "0";
            this._sender = frm;
            var _dm = (document.domain == location.host) ? '': 'document.domain="' + document.domain + '";',
            dout = '<html><head><meta http-equiv="Content-type" content="text/html; charset=' + this._charset + '"/></head><body><script>' + _dm + ';function ' + cfn + '(){frameElement.callback.apply(null, arguments);}<\/script><script charset="' + this._charset + '" src="' + da + '"><\/script><script>setTimeout(frameElement.errorCallback,50);<\/script></body></html>';
            frm.callback = _cb;
            frm.errorCallback = _ecb;
            this._waiting = true;
            if (ua.chrome || ua.opera || ua.firefox < 3) {
                frm.src = "javascript:'" + encodeURIComponent(FM.string.escString(dout)) + "'";
                document.body.appendChild(frm);
            } else {
                document.body.appendChild(frm);
                frm.contentWindow.document.open('text/html');
                frm.contentWindow.document.write(dout);
                frm.contentWindow.document.close();
            }
        }
    };
    FM.JSONGetter.prototype.destroy = function() {
        var n = this._name;
        delete FM.JSONGetter.instance[n]._sender;
        FM.JSONGetter.instance[n]._sender = null;
        delete FM.JSONGetter.instance[n];
        FM.JSONGetter.counter--;
        return null;
    };
    FM.loadJsonData = function(xID, url, callback, errcallback, refresh, charset, callbackFunctionName, noTryCatch) {
        if (!top.g_JData) top.g_JData = {};
        if (top.g_JData[xID] && !refresh && !top.g_JData[xID].error) {
            callback(top.g_JData[xID]);
            return;
        }
        charset = charset ? charset: "GB2312";
        var cFN = callbackFunctionName ? callbackFunctionName: "JsonCallback";
        var snd = new FM.JSONGetter(url, void(0), null, charset);
        snd.onSuccess = function(o) {
            if (!noTryCatch) {
                try {
                    callback(top.g_JData[xID] = o);
                } catch(err) {
                    if (err.number && err.number == -2146823281) {}
                }
            } else {
                callback(top.g_JData[xID] = o);
            }
        };
        if (typeof(errcallback) == 'function') {
            snd.onError = errcallback;
        }
        snd.send(cFN);
    }
    document.domain = FM.getDomain();
    FM.config = {
        debugLevel: 0,
        defaultDataCharacterSet: "GB2312",
        DCCookieDomain: document.domain,
        domainPrefix: "qq.com",
        toolPath: "http://imgcache.qq.com/music/miniportal_v4/tool/",
        tipsPath: "http://music.qq.com/tips/",
        gbEncoderPath: "http://imgcache.qq.com/qzone/v5/toolpages/",
        FSHelperPage: "http://music." + document.domain + "/musicapp/pengyou/fp_gbk.html",
        StorageHelperPage: "http://imgcache." + document.domain + "/music/miniportal_v4/tool/html/storage_helper.html",
        defaultShareObject: "http://qzs." + document.domain + "/qzone/v5/toolpages/getset.swf",
        staticServer: "http://imgcache.qq.com/ac/qzone/qzfl/lc/"
    };
    function isURL(s) {
        var p = /^(?:ht|f)tp(?:s)?\:\/\/(?:[\w\-\.]+)\.\w+/i;
        return p.test(s);
    }
    FM.FormSender = function(actionURL, method, data, charset) {
        if (!isURL(actionURL)) {
            rt.error("error actionURL -> {0:Q} in FM.FormSender construct!", actionURL);
            return null;
        }
        this.name = "_fpInstence_" + FM.FormSender.counter;
        FM.FormSender.instance[this.name] = this;
        FM.FormSender.counter++;
        this.method = method || "POST";
        this.uri = actionURL;
        this.data = (FM.lang.isHashMap(data) || typeof(data) == 'string') ? data: null;
        this.proxyURL = (typeof(charset) == 'string' && charset.toUpperCase() == "UTF-8") ? FM.config.FSHelperPage.replace(/_gbk/, "_utf8") : FM.config.FSHelperPage;
        this._sender = null;
        this.onSuccess = FM.emptyFn;
        this.onError = FM.emptyFn;
    };
    FM.FormSender.instance = {};
    FM.FormSender.counter = 0;
    FM.FormSender._errCodeMap = {
        999 : {
            msg: 'Connection or Server error'
        }
    };
    FM.FormSender.prototype.send = function() {
        if (this.method == 'POST' && this.data == null) {
            rt.warn("FM.FormSender -> {0:q}, can't send data 'null'!", this.name);
            return false;
        }
        function clear(o) {
            o._sender = o._sender.callback = o._sender.errorCallback = o._sender.onreadystatechange = null;
            if (ua.safari || ua.opera) {
                setTimeout('removeNode(FM.$("_fp_frm_' + o.name + '"))', 50);
            } else {
                removeNode(FM.$("_fp_frm_" + o.name));
            }
        }
        if (this._sender === null || this._sender === void(0)) {
            var sender = document.createElement("iframe");
            sender.id = "_fp_frm_" + this.name;
            sender.style.width = sender.style.height = sender.style.borderWidth = "0";
            document.body.appendChild(sender);
            sender.callback = FM.event.bind(this,
            function(o) {
                clearInterval(interval);
                clear(this);
                this.onSuccess(o);
            });
            sender.errorCallback = FM.event.bind(this,
            function(o) {
                clearInterval(interval);
                clear(this);
                this.onError(o);
            });
            if (typeof sender.onreadystatechange != 'undefined') {
                sender.onreadystatechange = FM.event.bind(this,
                function() {
                    if (this._sender.readyState == 'complete' && this._sender.submited) {
                        clear(this);
                        this.onError(FM.FormSender._errCodeMap[999]);
                    }
                });
            } else {
                var interval = setInterval(FM.event.bind(this,
                function() {
                    try {
                        var _t = this._sender.contentWindow.location.href;
                        if (_t.indexOf(this.uri) == 0) {
                            clear(this);
                            this.onError(FM.FormSender._errCodeMap[999]);
                            clearInterval(interval);
                        }
                    } catch(err) {
                        clear(this);
                        this.onError(FM.FormSender._errCodeMap[999]);
                        clearInterval(interval);
                    }
                }), 100);
            }
            this._sender = sender;
        }
        this._sender.src = this.proxyURL;
        return true;
    };
    FM.FormSender.prototype.destroy = function() {
        var n = this.name;
        delete FM.FormSender.instance[n]._sender;
        FM.FormSender.instance[n]._sender = null;
        delete FM.FormSender.instance[n];
        FM.FormSender.counter--;
        return null;
    };
    FM.getElementInBody = function(id, tagName, insertFirst, parentNodeID, className, initCSSText) {
        var e = FM.$(id);
        if (!e) {
            tagName = (!tagName) ? "div": tagName;
            e = document.createElement(tagName);
            e.id = id;
            var parentNode = (!parentNodeID) ? document.body: FM.$(parentNodeID);
            if (insertFirst) {
                parentNode.insertBefore(e, parentNode.firstChild);
            } else {
                parentNode.appendChild(e);
            }
            e.className = className ? className: "";
            e.style.cssText = initCSSText ? initCSSText: "";
        }
        parentNode = null;
        return e;
    }
    FM.getCookie = function(n) {
        var r = new RegExp("(\\b)" + n + "=([^;]*)(;|$)");
        var m = document.cookie.match(r);
        return (!m ? "": m[2]);
    };
    FM.setCookie = function(n, v, p, d) {
        if (!p) {
            p = "/";
        }
        if (!d) {
            d = document.domain;
        }
        document.cookie = n + "=" + v + "; path=" + p + "; domain=" + d;
    };
    FM.FvaildateUin = function(uin) {
        var R = /^[1-9]\d{4,11}$/;
        return R.test(uin);
    }
    FM.g_iLoginUin = 0;
    FM.g_iUin = 0;
    FM.getLoginUin = function() {
        function FvaildateUin(uin) {
            var R = /^[1-9]\d{4,11}$/;
            return R.test(uin);
        }
        var R = /^o(0)*/;
        var uin = FM.getCookie("uin");
        uin = parseInt(uin.replace(R, ''));
        if (FvaildateUin(uin)) {
            FM.g_iLoginUin = uin;
            return uin;
        } else {
            var luin = FM.getCookie("luin");
            luin = parseInt(luin.replace(R, ''));
            if (FvaildateUin(luin)) {
                FM.g_iLoginUin = luin;
                return luin;
            } else return 0;
        }
    };; (function(m) {
        m.debugMode = false;
        m.BQQPlayer = null;
        m.MediaPlayer = null;
        m.VH5Player = null;
        m.VFlashPlayer = null;
        m.bUseBQQPlayer = true;
        m.idBAutoPlay = null;
        m.S_UNDEFINE = 0;
        m.S_STOP = 1;
        m.S_PAUSE = 2;
        m.S_PLAYING = 3;
        m.S_BUFFERING = 4;
        m.S_PLAYBEGIN = 5;
        m.S_PLAYEND = 6;
        m.S_FORWORD = 4;
        m.S_RESERVSE = 5;
        m.S_BUFFERING_WMP = 6;
        m.S_WAITING = 7;
        m.S_MEDIAEND = 8;
        m.S_TRANSITION = 9;
        m.S_READY = 10;
        m.S_RECONNECTION = 11;
        m.REP_PLAYURL_IP_ARRAY = ["121.14.73.62", "121.14.73.48", "58.60.9.178", "58.61.165.54"];
        m.REP_PLAYURL_PORT = 17785;
        m.timeIndex = ((new Date()).getTime() % 2);
        m.P2P_UDP_SVR_IP = ["58.61.166.180", "119.147.65.30"][m.timeIndex];
        m.P2P_TCP_SVR_IP = ["58.61.166.180", "119.147.65.30"][m.timeIndex];
        m.P2P_UDP_SVR_PORT = 8000;
        m.P2P_TCP_SVR_PORT = 433;
        m.P2P_STUN_SVR_IP = "stun-a1.qq.com";
        m.P2P_STUN_SVR_PORT = 8000;
        m.P2P_TORRENT_URL = "http://219.134.128.55/";
        m.P2P_CACHE_SPACE = 100;
        m.ACTIVE_INTERVAL = 120;
        m.REP_SONGLIST_PORT = 8000;
        m.REP_SONGLIST_IP_ARRAY = ["121.14.94.181", "121.14.94.183"];
        m.REP_SONGLIST_PROGRAM = "QZoneWebClient";
        m.REP_PLAYSONG_IP_ARRAY = ["58.60.11.85", "121.14.96.113", "121.14.73.198", "121.14.95.82"];
        m.REP_PLAYSONG_PORT = 8000;
        m.STAT_REPORT_SVR_IP = "219.134.128.41";
        m.STAT_REPORT_SVR_PORT = 17653;
        m.MUSIC_COOKIE_DOMAIN = "qq.com";
        m.PANEL_UIN_COOKIE_NAME = "zzpaneluin";
        m.PANEL_KEY_COOKIE_NAME = "zzpanelkey";
        m.MUSIC_UIN_COOKIE_NAME = "qqmusic_uin";
        m.MUSIC_KEY_COOKIE_NAME = "qqmusic_key";
        m.MAX_PLAYLIST_NUM = 200;
        m.bqqplayer_play_flag = true;
    })(FM);
    FM.Tooltip = {
        msg: function() {
            var args = [].slice.apply(arguments);
            var jsList = ['lib/jquery', 'lib/pengyou'];
            seajs.use(jsList,
            function($, PY) {
                PY.Tooltip.msg.apply(null, args);
            });
        },
        success: function() {
            var args = [].slice.apply(arguments);
            var jsList = ['lib/jquery', 'lib/pengyou'];
            seajs.use(jsList,
            function($, PY) {
                PY.Tooltip.success.apply(null, args);
            });
        }
    };
    FM.widget = FM.widget || {};
    MUSIC.widget = MUSIC.widget || {};
    FM.widget.user = {
        callback: null,
        getUin: function() {
            return FM.getLoginUin();
        },
        isLogin: function() {
            return FM.widget.user.getUin() > 10000 ? true: false;
        },
        openLogin: function(url, target) {
            FM.Tooltip.msg("请先登录");
            window.location.href = "http://www.pengyou.com";
        },
        getVipInfo: function(callBack, errCallBack) {
            var _userinfo = UserInfoCookie.get();
            if (_userinfo != null) {
                if (callBack) {
                    callBack(_userinfo);
                }
                return;
            }
            var url = "http://portalcgi.music.qq.com/fcgi-bin/music_mini_portal/cgi_getuser_info.fcg?rnd=" + new Date().valueOf();
            FM.loadJsonData("userinfo", url,
            function(data) {
                if (! ('retcode' in data) || data.retcode == 0) {
                    UserInfoCookie.set(data);
                    if (callBack) {
                        callBack(data);
                    }
                } else {
                    if (errCallBack) {
                        errCallBack();
                    }
                }
            },
            function() {
                _error();
            },
            true, "utf-8", "MusicJsonCallback");
            function _error() {
                if (errCallBack) {
                    errCallBack();
                } else {}
            };
        },
        getExternInfo: function(callBack, errCallBack) {
            var _userinfo = UserExternCookie.get();
            if (_userinfo != null) {
                if (callBack) {
                    callBack(_userinfo);
                }
                return;
            }
            var url = "http://portalcgi.music.qq.com/fcgi-bin/music_mini_portal/cgi_getuser_extern.fcg?needisopen=1&rnd=" + new Date().valueOf();
            FM.loadJsonData("externinfo", url,
            function(data) {
                if (! ('retcode' in data) || data.retcode == 0) {
                    UserExternCookie.set(data);
                    if (callBack) {
                        callBack(data);
                    }
                } else {
                    err_dealwith();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "MusicJsonCallback");
            j.onSuccess = function(data) {
                if (! ('retcode' in data) || data.retcode == 0) {
                    UserExternCookie.set(data);
                    if (callBack) {
                        callBack(data);
                    }
                } else {
                    err_dealwith();
                }
            }
            function _error() {
                if (errCallBack) {
                    errCallBack();
                }
            };
        }
    };
    window.g_user = FM.widget.user;
    FM.config.DCCookieDomain = FM.getDomain();
    FM.cookie = {
        set: function(name, value, domain, path, hour) {
            if (hour) {
                var expire = new Date();
                expire.setTime(expire.getTime() + 3600000 * hour);
            }
            document.cookie = name + "=" + escape(value) + "; " + (hour ? ("expires=" + expire.toGMTString() + "; ") : "") + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + FM.config.DCCookieDomain + ";"));
            return true;
        },
        get: function(name) {
            var r = new RegExp("(?:^|;+|\\s+)" + name + "=([^;]*)"),
            m = document.cookie.match(r);
            return (!m ? "": unescape(m[1]));
        },
        del: function(name, domain, path) {
            document.cookie = name + "=; expires=Mon, 26 Jul 1997 05:00:00 GMT; " + (path ? ("path=" + path + "; ") : "path=/; ") + (domain ? ("domain=" + domain + ";") : ("domain=" + FM.config.DCCookieDomain + ";"));
        }
    };
    FM.CookieSet = function() {
        var args = Array.prototype.slice.apply(arguments);
        var _key = '';
        var _uin = FM.widget.user.getUin();
        return {
            delimeter: ',',
            basekey: '',
            check_func: null,
            need_attrs: [],
            key_need_uin: false,
            value_need_uin: true,
            key: function() {
                if (_key) return _key;
                if (!this.basekey) {
                    return null;
                }
                var key = this.basekey;
                if (this.key_need_uin) {
                    if (_uin <= 10000) {
                        return null;
                    }
                    key += uin;
                }
                _key = key;
                return key;
            },
            get: function() {
                var key = this.key();
                if (!key) {
                    return null;
                }
                var cookie = FM.getCookie(key);
                var parts = cookie.split(this.delimeter);
                var need_length = args.length + (this.value_need_uin ? 1 : 0);
                if (parts.length != need_length) {
                    this.clear();
                    return null;
                }
                if (this.value_need_uin) {
                    if (parseInt(parts[0]) != _uin) {
                        this.clear();
                        return null;
                    }
                    parts.splice(0, 1);
                }
                var data = {};
                FM.object.each(args,
                function(arg, idx) {
                    var value = parts[idx];
                    data[arg] = value;
                });
                if (typeof this.check_func == 'function') {
                    if (!this.check_func(data)) {
                        this.clear();
                        return null;
                    }
                }
                return data;
            },
            set: function(data) {
                var key = this.key();
                if (!key) {
                    return false;
                }
                if (typeof this.check_func == 'function') {
                    if (!this.check_func(data)) {
                        return false;
                    }
                }
                var parts = [];
                if (this.value_need_uin) {
                    parts.push(_uin);
                }
                FM.object.each(args,
                function(arg) {
                    var value = "" + data[arg];
                    if (value.constructor != Function) {
                        parts.push(value.replace(/,/g, "%2c"));
                    }
                });
                setCookie(key, parts.join(this.delimeter));
                return true;
            },
            clear: function() {
                var key = this.key();
                if (!key) {
                    return false;
                }
                delCookie(key);
                return true;
            }
        };
    };
    var getCookie = FM.cookie.get;
    var setCookie = FM.cookie.set;
    var delCookie = FM.cookie.del;
    var UserInfoCookie = FM.CookieSet('vip', 'nickname', 'score', 'place', 'payway', 'start', 'end', 'yearFlag', 'yearstart', 'yearend', 'nowtime');
    UserInfoCookie.basekey = 'detail';
    UserInfoCookie.need_attrs = ['vip', 'score', 'place', 'payway', 'yearFlag'];
    var UserExternCookie = FM.CookieSet('msgcount', 'isopenminiblog');
    UserExternCookie.basekey = 'extern';
    UserExternCookie.need_attrs = ['msgcount', 'isopenminiblog'];
    FM.widget.Storage = MUSIC.widget.Storage = {
        helperUrl: FM.config.StorageHelperPage,
        ifrCallback: null,
        instance: null,
        getInstance: function() {
            var _ins = this["instance"];
            if (_ins) {
                return _ins;
            }
            return null;
        }
    };
    FM.widget.Storage.create = function(cb, opt) {
        if (typeof cb != "function") {
            return;
        }
        opt = opt || {};
        var db = null,
        dbname = opt.dbname || "qzone_database",
        defaultDomain = opt.domain || document.domain,
        helperUrl = opt.helper || FM.widget.Storage.helperUrl,
        share = opt.share || false,
        _clientStore = ["globalStorage", "localStorage", "userData"];
        var _cs = FM.widget.Storage;
        var createHelper = function(th, type) {
            var i = document.createElement("iframe");
            i.id = "userData_iframe_" + dbname;
            i.style.display = "none";
            i.src = helperUrl;
            FM.widget.Storage.ifrCallback = function() {
                db = i.contentWindow.create(dbname, type);
                if (db) {
                    cb(th);
                } else {
                    cb(false);
                }
            };
            document.body.appendChild(i);
        };
        var getExpireDate = function(days) {
            var d = new Date();
            days = days || 365 * 3;
            d.setDate(d.getDate() + days);
            return d.toUTCString();
        }
        var _backend = {};
        _backend.userData = {
            isSupport: !!window.ActiveXObject,
            type: 1,
            get: function(key, cb) {
                db.load(dbname);
                var val = db.getAttribute(key); (typeof cb == "function") && cb(val);
                return val;
            },
            set: function(key, value) {
                try {
                    db.load(dbname);
                    db.setAttribute(key, value);
                    db.save(dbname);
                    return true;
                } catch(ex) {
                    return false;
                }
            },
            remove: function(key) {
                db.load(dbname);
                db.removeAttribute(key);
                db.save(dbname);
            },
            init: function() {
                if (share) {
                    createHelper(this, "userData");
                    return;
                }
                var el = (document.documentElement || document.body);
                el.addBehavior("#default#userdata");
                el.load(dbname);
                db = el;
                cb(this);
            },
            clear: function() {
                try {
                    db.load(dbname);
                    db.expires = new Date(1234567890000).toUTCString();
                    db.save(dbname);
                    db.load(dbname);
                    db.expires = getExpireDate();
                    db.save(dbname);
                    return true;
                } catch(ex) {
                    return false;
                }
            }
        };
        _backend.globalStorage = {
            isSupport: !!window.globalStorage,
            type: 2,
            get: function(key, cb) {
                var v = (v = db.getItem(key)) && v.value ? v.value: v; (typeof cb == "function") && cb(v);
                return v;
            },
            set: function(key, value) {
                try {
                    db.setItem(key, value);
                    return true;
                } catch(ex) {
                    return false;
                }
            },
            remove: function(key) {
                db.removeItem(key);
            },
            init: function() {
                if (db = window.globalStorage[share ? defaultDomain: document.domain]) {
                    cb(this);
                } else {
                    cb(false);
                }
            },
            clear_flag: false,
            clear_arr: [],
            clear: function(cb) {
                var ar = this.clear_arr;
                if (this.clear_flag) {
                    return;
                }
                this.clear_flag = true;
                for (var k in db) {
                    ar.push(k);
                }
                var clearXItems = function(x) {
                    x = x > ar.length ? ar.length: x;
                    for (var i = 0; i < x; i++) {
                        var k = ar.shift();
                        db.removeItem(k);
                    }
                    if (ar.length > 0) {
                        setTimeout(function() {
                            clearXItems(x);
                        },
                        50);
                    } else {
                        typeof cb == "function" && cb();
                    }
                }
                clearXItems(5);
            }
        };
        _backend.localStorage = {
            isSupport: !!window.localStorage,
            type: 3,
            get: _backend.globalStorage.get,
            set: _backend.globalStorage.set,
            remove: _backend.globalStorage.remove,
            init: function() {
                if (share) {
                    createHelper(this, "localStorage");
                    return;
                }
                if (db = window.localStorage) {
                    cb(this);
                } else {
                    cb(false);
                }
            },
            clear: function() {
                db.clear();
            }
        }; (function() {
            for (var i = 0,
            len = _clientStore.length; i < len; i++) {
                if (_backend[_clientStore[i]].isSupport) { (_cs["instance"] = _backend[_clientStore[i]]).init();
                    return;
                }
            }
            cb(false);
        })();
    }; (function(qs) {
        var isDoing = false,
        queue = [],
        opt;
        qs.setOptions = function(opts) {
            opt = opts;
        };
        qs.init = function() {
            var args = arguments;
            if (isDoing) {
                queue.push([args[0], args[1]]);
                return;
            }
            queue.push([args[0], args[1]]);
            isDoing = true;
            qs.create(function(ins) {
                var t;
                if (ins) {
                    qs.get = ins.get;
                    qs.set = ins.set;
                    qs.remove = ins.remove;
                    qs.clear = ins.clear;
                    while (t = queue.pop()) {
                        ins[t[0]].apply(null, t[1]);
                    }
                } else {
                    if (args[0] == "get") {
                        args[1][2](null);
                    }
                }
            },
            opt);
        };
        qs.get = function() {
            qs.init("get", arguments);
        };
        qs.set = function() {
            qs.init("set", arguments);
        };
        qs.remove = function() {
            qs.init("remove", arguments);
        };
        qs.clear = function() {
            qs.init("clear", arguments);
        };
    })(FM.widget.Storage);
    window.g_storage = FM.widget.Storage;
    FM.storageIns = null;
    FM.localStore = {
        userdata_loaded: false,
        dataName: "pengyouradio" + FM.getLoginUin(),
        oUserData: false,
        DEFAULT_CAPACITY: 100,
        getList: function(cb) {
            try {
                cb = cb ||
                function() {};
                var sUserData = FM.getCookie(this.dataName);
                if (sUserData === null || sUserData == "") {
                    cb([]);
                    return [];
                }
                var aRet = [];
                try {
                    aRet = eval(sUserData);
                } catch(e) {
                    aRet = [];
                }
                if (!FM.lang.isArray(aRet)) {
                    aRet = [];
                }
                cb(aRet);
                return aRet;
            } catch(e) {}
        },
        setList: function(aList) {
            var iLen = aList.length;
            if (iLen === 0) {
                FM.setCookie(this.dataName, "[]");
                return;
            }
            var buf = [];
            buf.push('[');
            for (var i = 0; i < iLen; i++) {
                if (i > 0) {
                    buf.push(',');
                }
                buf.push('[');
                buf.push(aList[i][0]);
                buf.push(',');
                buf.push(aList[i][1]);
                buf.push(',');
                buf.push(aList[i][2]);
                buf.push(',');
                buf.push('"');
                buf.push(aList[i][3].myEncode());
                buf.push('",');
                buf.push(aList[i][4]);
                buf.push(',');
                buf.push('"');
                buf.push(aList[i][5].myEncode());
                buf.push('",');
                buf.push('"');
                buf.push(aList[i][6].myEncode());
                buf.push('",');
                buf.push('"');
                buf.push(aList[i][7].myEncode());
                buf.push('",');
                buf.push('"');
                buf.push(aList[i][8].myEncode());
                buf.push('",');
                buf.push(aList[i][9]);
                buf.push(']');
            }
            buf.push(']');
            FM.setCookie(this.dataName, buf.join(""));
        },
        formatJson: function(aList) {
            try {
                var iLen = aList.length;
                if (!FM.lang.isArray(aList) || iLen == 0) {
                    return [];
                }
                var songList = [];
                for (var i = 0; i < iLen; i++) {
                    var songInfo = {
                        mId: aList[i][0],
                        mSongId: aList[i][1],
                        mSongType: aList[i][2],
                        mSongUrl: aList[i][3],
                        mDuration: aList[i][4],
                        mPlayURL: aList[i][5],
                        mTorrentURL: aList[i][6],
                        mSongName: aList[i][7].entityReplace().myEncode(),
                        mSingerName: aList[i][8].entityReplace().myEncode(),
                        mExpire: aList[i][9]
                    };
                    songList.push(songInfo);
                }
                return songList;
            } catch(e) {
                return [{}];
            }
        },
        format2Array: function(aList) {
            var iLen = aList.length;
            if (!FM.lang.isArray(aList) || iLen == 0) {
                return [];
            }
            var songList = [];
            for (var i = 0; i < iLen; i++) {
                var songInfo = [aList[i].mId, aList[i].mSongId, aList[i].mSongType, aList[i].mSongUrl, aList[i].mDuration, aList[i].mPlayURL, aList[i].mTorrentURL, aList[i].mSongName, aList[i].mSingerName, aList[i].mExpire];
                songList.push(songInfo);
            }
            return songList;
        }
    };
    FM.isFirstLoad = true;
    FM.fmInfo = {
        fmId: 0,
        fmType: 1,
        fmName: "热歌"
    };
    FM.localList = [];
    try {
        if (FM.isFirstLoad) {
            FM.localStore.getList(function(list) {
                FM.localList = FM.localStore.formatJson(list);
            });
        }
    } catch(e) {};
    FM.resumeAlbumId = 0;
    FM.resetProgress = function() {
        try {
            g_fmChn._divSongBarLine.style.width = '0%';
        } catch(e) {}
    }
    FM.resumeMusic = function() {
        try {
            var m = FM;
            if (m.isFirstLoad) {
                FM.console.print("resumeMusic 2:", FM.getCookie("radio"));
                m.isFirstLoad = false;
                if (FM.getCookie("radio").split("|")[0] == FM.getLoginUin()) {
                    FM.cookie.del("radio", document.domain, "/");
                    FM.console.print("resumeMusic 4,FM.localList.length:", FM.localList.length);
                    if (FM.localList.length > 0) {
                        var musicState = FM.getCookie("pengyouradio");
                        FM.cookie.del("pengyouradio", document.domain, "/");
                        FM.console.print("resumeMusic 5,musicStateh:", musicState);
                        var arrayState = musicState.split(",");
                        var lastTime = parseInt(arrayState[4], 10);
                        FM.curTime = +new Date();
                        var lastUrl = arrayState[6];
                        if (lastUrl == undefined || lastUrl == location.href) {
                            FM.console.print("resumeMusic 7");
                            FM.BstopPlayer();
                            FM.resetProgress();
                            return false;
                        }
                        var timeSpan = m.curTime - lastTime;
                        if (timeSpan <= 5 * 60 * 1000 && timeSpan >= 0 && arrayState[2] == "true") {
                            FM.console.print("resumeMusic 8,");
                            FM.pauseFromApp = false;
                            if (FM.getPlayer()) {
                                FM.console.print("resumeMusic 9,");
                                FM.getPlayer().mPlayList.mpList = m.localList;
                                FM.resumeAlbumId = arrayState[5];
                                m.localList[0].malbumid = arrayState[5];
                                var songInfo = m.localList[0];
                                songInfo.mid = songInfo.mSongId;
                                g_fmChn._curSongInfo = songInfo;
                                g_fmChn._divSongName.innerHTML = '<strong>' + songInfo.mSongName + '</strong> - <span>' + songInfo.mSingerName + '</span>';
                                g_fmChn._divSongName.title = songInfo.mSongName.unescapeHTML() + ' - ' + songInfo.mSingerName.unescapeHTML();
                                g_fmChn._divSongBarLine.style.width = arrayState[7];
                                FM.pic.change('http://ctc.imgcache.qq.com/music/photo/album/' + (songInfo.malbumid % 100) + '/albumpic_' + songInfo.malbumid + '_0.jpg');
                                FM.console.print("resumeMusic 10,", songInfo.mSongName, songInfo.mSingerName, songInfo.malbumid);
                            }
                            var fmIdType = arrayState[3].split("_");
                            if (fmIdType.length > 2) {
                                FM.fmInfo = {
                                    fmId: fmIdType[0],
                                    fmType: fmIdType[1],
                                    fmName: fmIdType[2]
                                };
                            }
                            var curPos = 0;
                            if ( !! m.BQQPlayer && FM.compareVer(m.BQQPlayer.plv, "8.5.2011.228") >= 0) {
                                FM.console.print("resumeMusic 11,");
                                m.BQQPlayer.mPlayingPos = curPos;
                                var obj = m.BQQPlayer.mPlayList.getObject(curPos);
                                FM.console.print("resumeMusic 12,");
                                return true;
                            } else {
                                FM.console.print("resumeMusic 13,");
                                var volume = "" + g_webPlayer.getVolumn();
                                if ( !! ua.chrome || FM.VFlashPlayer) {
                                    g_webPlayer.setVolumn(0);
                                }
                                if (!FM.VFlashPlayer) {
                                    FM.BmutePlayer();
                                }
                                FM.BrunPlayer(curPos);
                                setTimeout(function() {
                                    try {
                                        FM.setPlayProgressTime(arrayState[1]);
                                        if (!FM.VFlashPlayer) {
                                            FM.BmutePlayer();
                                        }
                                        if ( !! ua.chrome || FM.VFlashPlayer) {
                                            var vol = FM.getCookie('fmvol') || '50';
                                            g_webPlayer.setVolumn(vol);
                                        }
                                    } catch(e) {
                                        FM.console.print("resumeMusic 3076 exp:", e.message);
                                    }
                                },
                                3000);
                            }
                            return true;
                        }
                    }
                }
            }
        } catch(e) {
            FM.console.print("resumeMusic,exception:", e.message);
        };
        FM.BstopPlayer();
        FM.resetProgress();
        return false;
    }
    FM.isPlaying = function() {
        try {
            var obj = FM.getPlayer();
            if (!obj) {
                return false;
            }
            if ( !! FM.BQQPlayer) {
                FM.console.print("FM.isPlaying 3,", obj.getPlayerSource(), obj.getCurrentPlayerSource(), obj.isPlaying(), obj.getStatus(), obj.mPlayerState);
                return (obj.getPlayerSource() == obj.getCurrentPlayerSource() && obj.isPlaying());
            } else {
                return obj.isPlaying();
            }
        } catch(e) {
            return false;
        }
    },
    FM.beforeUnload = function() {
        try {
            var oplayer = FM.getPlayer();
            var isPlaying = FM.isPlaying();
            if ( !! isPlaying) {
                FM.setCookie("pengyouradio", "" + oplayer.mPlayingPos + "," + oplayer.mCurPlayPos + "," + FM.isPlaying() + "," + g_fmChn._curFmInfo.fmId + "_" + g_fmChn._curFmInfo.fmType + "_" + g_fmChn._curFmInfo.fmName + "," + (new Date()).getTime() + "," + (g_webPlayer.getSongInfoObj().malbumid || FM.resumeAlbumId) + "," + location.href + "," + g_fmChn._divSongBarLine.style.width, "/", document.domain);
                FM.setCookie("radio", FM.getLoginUin() + "|" + ( !! FM.BQQPlayer ? FM.BQQPlayer.mPlayerSource: "pengyou_player"), "/", document.domain);
            }
        } catch(e) {};
        FM.tj2rp.statSong();
    }
    FM.event.addEvent(window, "beforeunload", FM.beforeUnload);
    FM.module = FM.module || {};
    FM.module.webPlayer = {};
    FM.module.webPlayer.playerList = function() {
        var mPostion = -1;
        var mMode = 1;
        var mpList = [];
        function getCount() {
            return mpList.length;
        }
        function lastPostion() {
            mPostion = (mPostion - 1 + mpList.length) % mpList.length;
            return mPostion;
        }
        function nextPostion() {
            if (mMode == 4) {
                var rnd = parseInt(Math.random() * 100000) % getCount();
                if (rnd == mPostion) {
                    rnd = (rnd + 1) % getCount();
                }
                mPostion = rnd;
            } else {
                mPostion = (mPostion + 1) % getCount();
            }
            return mPostion;
        }
        function autoNextPostion() {
            if (mMode == 1) {
                if (mPostion < 0 || mPostion >= getCount()) {
                    mPostion = 0;
                }
            } else if (mMode == 2) {
                if (isLastPlayer()) {
                    return false;
                }
                mPostion = (mPostion + 1) % getCount();
            } else if (mMode == 3) {
                mPostion = (mPostion + 1) % getCount();
            } else if (mMode == 4) {
                var rnd = parseInt(Math.random() * 100000) % getCount();
                if (rnd == mPostion) {
                    rnd = (rnd + 1) % getCount();
                }
                mPostion = rnd;
            }
            return true;
        }
        function setMode(mode) {
            if (mode < 1 || mode > 5) {
                mode = 1;
            }
            mMode = mode;
        }
        function setPostion(pos) {
            if (pos >= 0 && pos < mpList.length) {
                mPostion = pos;
            }
        }
        function getPostion() {
            return mPostion;
        }
        function isLastPlayer() {
            return (mPostion + 1) == mpList.length;
        }
        function getSongInfoObj() {
            return mpList[mPostion < 0 ? 0 : mPostion];
        }
        function setPlayerList(arr, mode) {
            if (typeof arr != "object") {
                return false;
            }
            clearPlayerList();
            for (var i = 0,
            len = arr.length; i < len; i++) {
                if (typeof arr[i] == "object") {
                    mpList.push(arr[i]);
                }
            }
            mPostion = -1;
            if (typeof mode == 'undefined') {
                setMode(2);
            } else {
                setMode(mode);
            }
        }
        function addSongList(list) {
            for (var i = 0,
            len = list.length; i < len; i++) {
                if (typeof list[i] == "object") {
                    mpList.push(list[i]);
                }
            }
        }
        function delSong(pos) {
            if (pos >= 0 && pos < mpList.length) {
                mpList.splice(pos, 1);
            }
            if (pos < mPostion) {
                mPostion--;
            }
            if (mPostion >= mpList.length) {
                mPostion = mpList.length - 1;
            }
            if (mpList.length == 0) {
                mPostion = -1;
            }
        }
        function clearPlayerList() {
            for (var i = 0,
            len = mpList.length; i < len; i++) {
                delete mpList[i];
            }
            mpList = [];
            mPostion = -1;
        }
        return {
            getCount: getCount,
            isLastPlayer: isLastPlayer,
            lastPostion: lastPostion,
            nextPostion: nextPostion,
            autoNextPostion: autoNextPostion,
            setPostion: setPostion,
            getPostion: getPostion,
            getSongInfoObj: getSongInfoObj,
            setPlayerList: setPlayerList,
            addSongList: addSongList,
            delSong: delSong,
            clearPlayerList: clearPlayerList,
            setMode: setMode
        };
    };
    FM.module.webPlayer.playStatus = {
        S_UNDEFINE: 0,
        S_STOP: 1,
        S_PAUSE: 2,
        S_PLAYING: 3,
        S_BUFFERING: 4,
        S_PLAYBEGIN: 5,
        S_PLAYEND: 6
    };
    FM.module.webPlayer.interFace = (function() {
        var VQQPlayer = null;
        var MediaPlayer = null;
        var VH5Player = null;
        var webPlayer = null;
        var playerList = null;
        var musicInitReady = false;
        var songDuration = 0;
        var curPostion = 0;
        var mIsLoop = false;
        var mIsH5Mp3 = true;
        var mPlayerType = 0;
        var mOption = {
            fromtag: 28,
            statFromtag: 0,
            errorTips: function(title, text) {
                alert(title + "</br>" + text);
            }
        };
        var wmaurl_tpl = 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3';
        var wmaurl_tpl2 = 'http://stream%(stream).qqmusic.qq.com/%(sid).wma';
        var mp3url_tpl = 'http://stream%(stream).qqmusic.qq.com/%(sid).mp3';
        var tpturl_tpl = 'http://tpt.music.qq.com/%(sid).tpt';
        var songInfoObj = {
            mstream: 0,
            murl: '',
            msong: '',
            msinger: '',
            mQzoneKey: '',
            mid: 0,
            mSongType: 0
        };
        function init(opt) {
            FM.object.extend(mOption, opt || {});
        }
        function getOption() {
            return mOption;
        }
        function setCurPostion(cp, duration) {
            curPostion = cp;
            songDuration = duration;
        }
        function getCurPostion() {
            return curPostion;
        }
        function getPostion() {
            return playerList.getPostion();
        }
        function setSongInfoObj(obj) {
            FM.object.extend(songInfoObj, obj || {});
        }
        function getSongInfoObj() {
            return songInfoObj;
        }
        function initMusic(callback) {
            FM.initMusic(callback);
        }
        function OnSongPlayBegin(songinfo, index, total) {}
        function OnSongPlayEnd(songinfo, index, total) {}
        function OnSongPlaying(lCurPos, lTotal) {}
        function OnPlayPause() {}
        function OnPlayStop() {}
        function OnPlaying() {}
        function OnPlayError(_obj, index) {
            try {
                if ( !! _obj.mid && !!_obj.mstream && _obj.mid > 0 && _obj.mstream > 0) {} else {
                    FM.console.print('歌曲播放失败！', '您添加的网络歌曲，地址出错或被主人删除。');
                }
            } catch(e) {}
        }
        function startPlayer() {
            FM.pauseAppMusic();
            webPlayer = FM.getPlayer();
            if ( !! webPlayer) {
                webPlayer.bereload = false;
                webPlayer.startPlayer();
            }
        }
        function pausePlayer() {
            webPlayer = FM.getPlayer(); !! webPlayer && webPlayer.pausePlayer();
            g_webPlayer.OnPlayPause();
        }
        function pausePlayerFromApp() {
            FM.pauseFromApp = true;
            pausePlayer();
            if ( !! FM.BQQPlayer) {
                FM.resetProgress();
            }
        }
        function stopPlayer() {
            webPlayer = FM.getPlayer(); !! webPlayer && webPlayer.stopPlayer();
        }
        function lastPlayer() {
            if (!playerList || playerList.getCount() <= 0) {
                return false;
            }
            playerList.lastPostion();
            playList();
            return true;
        }
        function nextPlayer() {
            if (!playerList || playerList.getCount() <= 0) {
                return false;
            }
            g_webPlayer.OnSongPlayEnd(getSongInfoObj(), playerList.getPostion(), playerList.getCount());
            playerList.nextPostion();
            playList();
            try {
                g_fmChn._btnPlay.className = "bar_btn_pause";
                g_fmChn._btnPlay.innerHTML = '<a href="javascript:;">暂停</a>';
                g_fmChn._btnPlay.title = "暂停";
                g_fmChn._btnPlay.onclick = g_fmChn.pauseFm;
            } catch(e) {}
            return true;
        }
        function autoNextPlayer() {
            try {
                if (!playerList || playerList.getCount() <= 0) {
                    return false;
                }
                g_webPlayer.OnSongPlayEnd(getSongInfoObj(), playerList.getPostion(), playerList.getCount());
                if (playerList.autoNextPostion()) {
                    playList();
                } else {
                    stopPlayer();
                }
            } catch(e) {}
            return true;
        }
        function playAnyPos(pos) {
            if (!playerList || playerList.getCount() <= 0) {
                return false;
            }
            playerList.setPostion(pos);
            playList();
            return true;
        }
        function addSong(list, isPlay) {
            var pos = playerList.getCount();
            playerList.addSongList(list);
            if (isPlay) {
                playerList.setPostion(pos);
                playList();
            }
        }
        function delSong(pos) {
            var curPos = playerList.getPostion();
            playerList.delSong(pos);
            if (pos == curPos) {
                if (playerList.getCount() <= 0) {
                    stopPlayer();
                    return false;
                }
                if (curPos >= (playerList.getCount() - 1)) {
                    playerList.setPostion(playerList.getCount() - 1);
                }
                playList();
            }
            return true;
        }
        function mutePlayer() {
            webPlayer = FM.getPlayer(); !! webPlayer && webPlayer.setMute();
        }
        function getVolumn() {
            webPlayer = FM.getPlayer();
            if (!webPlayer) {
                return 0;
            }
            return webPlayer.getVolumn();
        }
        function setVolumn(vol) {
            webPlayer = FM.getPlayer(); !! webPlayer && webPlayer.setVolumn(vol);
        }
        function setPlayerState(status) {
            webPlayer = FM.getPlayer(); !! webPlayer && webPlayer.setPlayerState(status);
        }
        function setPlayURL() {
            var _obj = g_webPlayer.getSongInfoObj();
            var playUrl = g_webPlayer.getSongUrl(_obj);
            if (playUrl == '') {
                alert('歌曲链接错误！');
                return;
            }
            var sid = _obj.mid;
            if ( !! _obj.mid) {}
            var stype = FM.tj2rp.getSongType(playUrl);
            if (stype == 1 || stype == 5) {
                sid = 0;
            }
            if (playUrl == 5) {
                FM.BplaySong_local(_obj.msong, playUrl, sid, _obj.msinger, _obj.mid, stype);
            } else {
                FM.BplaySong(_obj.msong, playUrl, sid, _obj.msinger, _obj.mid, stype);
            }
            return;
        }
        function playSong(obj) {
            if (typeof obj != "object") {
                mOption.errorTips('歌曲信息错误！', "");
                return;
            }
            if (!obj.mstream || !obj.mid) {
                mOption.errorTips('歌曲信息错误！', "");
                return;
            }
            setSongInfoObj(obj);
            initMusic(function() {
                setPlayURL();
            });
        }
        function setPlayerList(isPlay, arr, mode) { !! playerList || (playerList = g_playerList());
            playerList.setPlayerList(arr, mode);
            if (isPlay) {
                nextPlayer();
            }
        }
        function getPlayerList(isPlay, arr, mode) { !! playerList || (playerList = g_playerList());
            return playerList;
        }
        function setMode(mode) {
            if (!playerList) {
                return false;
            }
            playerList.setMode(mode);
            return true;
        }
        function playList() { !! playerList || (playerList = g_playerList());
            setSongInfoObj(playerList.getSongInfoObj());
            playBegin();
            if (! ( !! ua.isiPad || !!ua.isiPhone)) {
                setTimeout(function() {
                    initMusic(function() {
                        setPlayURL();
                    });
                },
                0);
            } else {
                initMusic(function() {
                    setPlayURL();
                });
            }
        }
        function playBegin() {
            if (!playerList) {
                return;
            }
            g_webPlayer.OnSongPlayBegin(getSongInfoObj(), playerList.getPostion(), playerList.getCount());
        }
        function getPlayerSource() {
            if ( !! FM.BQQPlayer) {
                return FM.BQQPlayer.getPlayerSource();
            }
        }
        function getCurrentPlayerSource() {
            if ( !! FM.BQQPlayer) {
                return FM.BQQPlayer.getCurrentPlayerSource();
            }
        }
        function setCurrentPlayerSource(args) { !! FM.BQQPlayer && FM.BQQPlayer.setCurrentPlayerSource(args);
        }
        function clearPlayerList() {
            if (!playerList) {
                return;
            }
            playerList.clearPlayerList();
            stopPlayer();
        }
        function getSongUrl(songobj) {
            var url = '';
            if ( !! songobj.mid && !!songobj.mstream && songobj.mid > 0 && songobj.mstream > 0) {
                var sid = parseInt(songobj.mid) + 30000000;
                url = wmaurl_tpl.jstpl_format({
                    stream: parseInt(songobj.mstream) + 10,
                    sid: sid
                });
            } else if ( !! songobj.msongurl) {
                url = songobj.msongurl;
            }
            return url;
        }
        function getTptUrl(songobj) {
            var url = '';
            if ( !! songobj.mid && !!songobj.mstream && songobj.mid > 0 && songobj.mstream > 0) {
                var sid = parseInt(songobj.mid) + 30000000;
                url = tpturl_tpl.jstpl_format({
                    sid: sid
                });
            }
            return url;
        }
        function isSupportMp3() {
            return mIsH5Mp3;
        }
        function getPlayerType() {
            return mPlayerType;
        }
        return {
            wmaurl_tpl: wmaurl_tpl,
            wmaurl_tpl2: wmaurl_tpl2,
            mp3url_tpl: mp3url_tpl,
            tpturl_tpl: tpturl_tpl,
            setSongInfoObj: setSongInfoObj,
            getSongInfoObj: getSongInfoObj,
            initMusic: initMusic,
            startPlayer: startPlayer,
            pausePlayer: pausePlayer,
            pausePlayerFromApp: pausePlayerFromApp,
            stopPlayer: stopPlayer,
            lastPlayer: lastPlayer,
            nextPlayer: nextPlayer,
            autoNextPlayer: autoNextPlayer,
            playAnyPos: playAnyPos,
            addSong: addSong,
            delSong: delSong,
            mutePlayer: mutePlayer,
            getVolumn: getVolumn,
            setVolumn: setVolumn,
            playSong: playSong,
            setPlayerState: setPlayerState,
            setCurPostion: setCurPostion,
            getCurPostion: getCurPostion,
            getPostion: getPostion,
            setPlayerList: setPlayerList,
            getPlayerList: getPlayerList,
            playList: playList,
            OnSongPlayBegin: OnSongPlayBegin,
            OnSongPlayEnd: OnSongPlayEnd,
            OnSongPlaying: OnSongPlaying,
            OnPlayPause: OnPlayPause,
            OnPlayStop: OnPlayStop,
            OnPlayError: OnPlayError,
            playBegin: playBegin,
            OnPlaying: OnPlaying,
            getPlayerSource: getPlayerSource,
            getCurrentPlayerSource: getCurrentPlayerSource,
            setCurrentPlayerSource: setCurrentPlayerSource,
            setMode: setMode,
            clearPlayerList: clearPlayerList,
            getSongUrl: getSongUrl,
            getTptUrl: getTptUrl,
            isSupportMp3: isSupportMp3,
            getPlayerType: getPlayerType,
            init: init,
            getOption: getOption,
            setPlayURL: setPlayURL
        }
    })();
    FM.module.webPlayer.eventCallback = (function() {
        var $T = top,
        $ = FM,
        $D = $.dom,
        $E = $.event;
        function OnInitialized(bSucc) {
            if (bSucc) {
                FM.event.addEvent(window, "unload",
                function() {
                    var mp = FM.BQQPlayer;
                    if ( !! mp) {
                        if (FM.getCookie("radio").split("|")[0] == FM.getLoginUin() && FM.compareVer(mp.plv, "8.5.2011.228") >= 0) {
                            mp.mPlayerName.SetRef(30000);
                        } else {
                            mp.unInitialize();
                        }
                    }
                });
            } else {
                FM.console.print("webPlayer initialize faied");
            }
        }
        function OnUnitialized() {}
        function OnStateChanged(lNewState) {
            if (lNewState >= 0 && lNewState <= 6) {
                g_webPlayer.setPlayerState(lNewState);
            }
            switch (lNewState) {
            case 0:
                g_webPlayer.setPlayerState(g_playerStatus.S_UNDEFINE);
                break;
            case 1:
                g_webPlayer.setPlayerState(g_playerStatus.S_STOP);
                g_webPlayer.OnPlayStop();
                break;
            case 2:
                g_webPlayer.setPlayerState(g_playerStatus.S_PAUSE);
                g_webPlayer.OnPlayPause();
                break;
            case 3:
                g_webPlayer.setPlayerState(g_playerStatus.S_PLAYING);
                g_webPlayer.OnPlaying();
                break;
            case 4:
                g_webPlayer.setPlayerState(g_playerStatus.S_BUFFERING);
                break;
            case 5:
                g_webPlayer.setPlayerState(g_playerStatus.S_PLAYBEGIN);
                break;
            case 6:
                try {
                    g_webPlayer.setPlayerState(g_playerStatus.S_PLAYEND);
                    g_webPlayer.autoNextPlayer();
                } catch(e) {
                    FM.console.print("OnStateChanged case 6 exp:", e.message);
                }
                break;
            default:
                break;
            }
        }
        function OnPlayProgress(lCurPos, lTotal) {
            lCurPos = parseInt(lCurPos);
            lTotal = parseInt(lTotal);
            g_webPlayer.setCurPostion(lCurPos, lTotal);
            FM.getPlayer().mCurPlayPos = lCurPos;
            FM.g_songPlayLen = lTotal;
            g_webPlayer.OnSongPlaying(lCurPos, lTotal);
        }
        function OnDownloadProgress(lCurPos, lProgress) {}
        function OnPlayError(lErrCode, sErrDesc) {
            try {
                var _obj = g_webPlayer.getSongInfoObj();
                var index = g_webPlayer.getPostion();
                g_webPlayer.OnPlayError(_obj, index);
            } catch(e) {}
            FM.console.print("playError,ErrCode:", lErrCode, "ErrDesc:", sErrDesc);
        }
        function OnPlaySrcChanged(sNewPlaySrc, sOldPlaySrc) {
            g_webPlayer.setCurrentPlayerSource(sNewPlaySrc);
            if (g_webPlayer.getCurrentPlayerSource() != g_webPlayer.getPlayerSource()) {
                g_webPlayer.setPlayerState(g_playerStatus.S_PAUSE);
                g_webPlayer.OnPlayPause();
            }
        }
        return {
            OnInitialized: OnInitialized,
            OnUnitialized: OnUnitialized,
            OnStateChanged: OnStateChanged,
            OnPlayProgress: OnPlayProgress,
            OnDownloadProgress: OnDownloadProgress,
            OnPlayError: OnPlayError,
            OnPlaySrcChanged: OnPlaySrcChanged
        };
    })();
    FM.module.webPlayer.stat = (function() {
        function add(songobj) {}
        return {
            add: add
        };
    })();
    window.g_player = FM.module.webPlayer;
    window.g_webPlayer = g_player.interFace;
    window.g_playerList = g_player.playerList;
    window.g_playerCallback = g_player.eventCallback;
    window.g_playerStatus = g_player.playStatus;
    window.g_playerStat = g_player.stat;
    FM.PlayListObject = function() {
        this.mId = -1;
        this.mSongId = 0;
        this.mSongType = 0;
        this.mSongUrl = "";
        this.mDuration = 0;
        this.mPlayURL = "";
        this.mTorrentURL = "";
        this.mSongName = "";
        this.mSingerName = "";
        this.mExpire = 0;
    };
    FM.PlayerListManager = function() {
        this.mFull = false;
        this.mPosition = -1;
        this.mpList = new Array();
        this.getCount = function() {
            return this.mpList.length;
        };
        this.getObject = function(n) {
            return this.mpList[n];
        };
        this.getPos = function(sul) {
            for (var i = 0,
            l = this.getCount(); i < l; i++) {
                if (this.getObject(i).mPlayURL == sul) {
                    return i;
                }
            }
            return - 1;
        };
        this.getPosById = function(Id) {
            for (var i = 0,
            l = this.getCount(); i < l; i++) {
                if (this.getObject(i).mId == Id) {
                    return i;
                }
            }
            return - 1;
        };
        this.findObjectById = function(id) {
            var i = this.getPosById(id);
            return (i != -1 ? this.getObject(i) : null);
        };
        this.findObject = function(sul) {
            var i = this.getPos(sul);
            return (i != -1 ? this.getObject(i) : null);
        };
        this.addObject = function(id, sul, stpt, iDuration, sSong, sSinger, sQzKey, iSongId, iSongType) {
            if (sul == "") {
                return;
            }
            var obj, pos;
            if (id > 0) {
                pos = this.getPosById(id);
            } else if (sul != "") {
                pos = this.getPos(sul);
            }
            if (pos == -1) {
                if (this.getCount() >= FM.MAX_PLAYLIST_NUM) {
                    this.mFull = true;
                    this.mPosition += 1;
                    if (this.mPosition >= FM.MAX_PLAYLIST_NUM) {
                        this.mPosition = 0;
                    }
                    obj = this.getObject(this.mPosition);
                } else {
                    obj = {};
                    this.mpList[this.getCount()] = obj;
                }
                obj.mId = id;
                obj.mPlayURL = sul;
                obj.mTorrentURL = stpt;
                obj.mDuration = iDuration;
                obj.mSongName = sSong;
                obj.mSingerName = sSinger;
                obj.mQzoneKey = sQzKey;
                obj.mSongId = (iSongId || 0);
                obj.mSongType = (iSongType || 0);
                obj.mSongUrl = sul;
                obj.mExpire = 0;
                this.saveToLocal();
            }
            return;
        };
        this.saveToLocal = function() {
            FM.localStore.setList(FM.localStore.format2Array(this.mpList));
        };
        this.clearObject = function() {
            for (var i = 0,
            l = this.getCount(); i < l; i++) {
                delete this.mpList[i];
            }
            this.mpList.length = 0;
        };
    };
    FM.clearCheckBuffering = function() {};
    FM.insertBQQPlayer = function(args) {
        if ( !! ua.ie) {
            params = {};
            objAttrs = {};
            for (var k in args) {
                switch (k) {
                case "classid":
                    continue;
                    break;
                case "style":
                case "name":
                case "height":
                case "width":
                case "id":
                    objAttrs[k] = args[k];
                    break;
                default:
                    params[k] = args[k];
                }
            }
            objAttrs["classid"] = "CLSID:E05BC2A3-9A46-4A32-80C9-023A473F5B23";
            var str = [];
            str.push('<object ');
            for (var i in objAttrs) {
                str.push(i);
                str.push('="');
                str.push(objAttrs[i]);
                str.push('" ');
            }
            str.push('>');
            for (var i in params) {
                str.push('<param name="');
                str.push(i);
                str.push('" value="');
                str.push(params[i]);
                str.push('" /> ');
            }
            str.push('</object>');
            FM.g_playerDiv = FM.getElementInBody("musicblog_fm", "div");
            FM.g_playerDiv.style.cssText = "height:0px;overflow:hidden";
            FM.g_playerDiv.innerHTML = str.join("");
            return FM.g_playerDiv.firstChild;
        } else {
            try {
                FM.g_playerDiv = FM.getElementInBody("musicblog_fm", "div");
                FM.g_playerDiv.style.cssText = "height:0px;overflow:hidden";
                FM.g_playerDiv.innerHTML = '<embed id="QzoneMusicFm" type="application/tecent-qzonemusic-plugin" width="0px" height="0px" />';
                var QzonePlayer = document.getElementById('QzoneMusic');
                var qmpVer = QzonePlayer.GetVersion(4);
                if (! (qmpVer >= "7.69")) {
                    FM.isNeedUpdatePlayer = true;
                    return false;
                }
                QzonePlayer.CreateAX("QzoneMusic.dll");
                for (var k in args) {
                    switch (k) {
                    case "classid":
                    case "style":
                    case "name":
                    case "height":
                    case "width":
                    case "id":
                    case "UsedWhirl":
                        continue;
                        break;
                    default:
                        QzonePlayer.setAttribute(k, args[k]);
                    }
                }
                var QzoneMusicVer = QzonePlayer.GetVersion(5);
                if (QzoneMusicVer >= "3.2") {
                    FM.P2P_UDP_SVR_IP = "pdlmusic.p2p.qq.com";
                    FM.P2P_TCP_SVR_IP = "pdlmusic.p2p.qq.com";
                }
                QzonePlayer.setAttribute("P2PUDPServ_IP", FM.P2P_UDP_SVR_IP);
                QzonePlayer.setAttribute("P2PTCPServ_IP", FM.P2P_TCP_SVR_IP);
                try {
                    QzonePlayer.UsedWhirl = "0";
                } catch(e) {}
                FM.bUseBQQPlayer = true;
                return QzonePlayer;
            } catch(e) {}
        }
    }
    FM.createBPlayer = function() {
        var ttii = (parseInt(Math.random() * 1000)) % FM.REP_PLAYSONG_IP_ARRAY.length;
        var ttii2 = (parseInt(Math.random() * 1000)) % FM.REP_SONGLIST_IP_ARRAY.length;
        var ttii3 = (parseInt(Math.random() * 1000)) % FM.REP_PLAYURL_IP_ARRAY.length;
        return FM.insertBQQPlayer({
            id: 'QzonePlayerFm',
            height: 0,
            width: 0,
            PlayerType: 2,
            CacheSize: FM.P2P_CACHE_SPACE,
            ValidDomain: 'pengyou.com',
            EnableSyncListen: 1,
            UploadStatCount: 10,
            ExitDelayTime: 5,
            UsedWhirl: 0,
            RestrictHttpStartInterval: 1,
            RestrictHttpStopInterval: 100,
            P2PUDPServ_IP: FM.P2P_UDP_SVR_IP,
            P2PUDPServ_Port: FM.P2P_UDP_SVR_PORT,
            P2PTCPServ_IP: FM.P2P_TCP_SVR_IP,
            P2PTCPServ_Port: FM.P2P_TCP_SVR_PORT,
            P2PStunServ_IP: FM.P2P_STUN_SVR_IP,
            P2PStunServ_Port: FM.P2P_STUN_SVR_PORT,
            RepPlaySong_IP: FM.REP_PLAYSONG_IP_ARRAY[ttii],
            RepPlaySong_Port: FM.REP_PLAYSONG_PORT,
            RepSongList_IP: FM.REP_SONGLIST_IP_ARRAY[ttii2],
            RepSongList_Port: FM.REP_SONGLIST_PORT,
            RepPlayURL_IP: FM.REP_PLAYURL_IP_ARRAY[ttii3],
            RepPlayURL_Port: FM.REP_PLAYURL_PORT
        });
    }
    FM.EventPlayer = function(oTarget, sEventType, fnHandler) {
        if (oTarget.attachEvent) {
            oTarget.attachEvent(sEventType, fnHandler);
        } else if (oTarget.addEventListener) {
            oTarget.addEventListener(sEventType, fnHandler, false);
        } else {
            oTarget[sEventType] = fnHandler;
        }
    }
    FM.EventPlayerRemove = function(oTarget, sEventType, fnHandler) {
        if (oTarget.detachEvent) {
            oTarget.detachEvent(sEventType, fnHandler);
        } else if (oTarget.removeEventListener) {
            oTarget.removeEventListener(sEventType, fnHandler, false);
        } else {
            oTarget[sEventType] = null;
        }
    }
    FM.BlogQQPlayer = function() {
        this.mPlayList = new FM.PlayerListManager();
        this.mPlayingPos = -1;
        this.mCurPlayPos = 0;
        this.mCurPlayTotal = 0;
        this.mPlayerSource = "";
        this.mCurPlaySrc = "";
        this.mPlayerType = "";
        this.mPlayerState = FM.S_UNDEFINE;
        this.mRandomPlay = false;
        this.mPlayerName = "";
        this.mP2P = false;
        this.mSyncStatus = false;
        this.mExistTime = 0;
        this.mUinCookie = 0;
        this.mKeyCookie = "";
        this.mFromTag = (FM.isPengyou ? 28 : 22);
        this.mIsInit = false;
        this.mRealInit = false;
        this.mInstall = false;
        this.mAlwreadyCheck = false;
        this.mHumanStop = false;
        this.mHumanPause = false;
        this.plv = "0";
        this.playerSrcSeted = false;
        this.mPlayUrl = "";
        this.mPlayBeginTime = 0;
        this.setPlayerState = function(status) {
            this.mPlayerState = status;
        }
        this.setPlayParams = function(iMusicId, sul) {
            this.mPlayerName.SetCookie("qqmusic_uin", this.mUinCookie);
            this.mPlayerName.SetCookie("qqmusic_key", this.mKeyCookie);
            this.mPlayerName.SetCookie("qqmusic_fromtag", this.mFromTag);
            var tiMusicId = "" + iMusicId;
            this.mPlayerName.SetCookie("qqmusic_musicid", tiMusicId);
            this.mPlayerName.SetCookie("qqmusicchkkey_key", this.mKeyCookie);
            this.mPlayerName.SetCookie("qqmusicchkkey_url", sul);
            return;
        };
        this.checkPlayer = function() {
            try {
                this.plv = this.mPlayerName.GetVersion(4);
            } catch(e) {
                FM.console.print("checkPlayer,exp:" + e.message);
                this.plv = "0";
            }
            return true;
        };
        this.getPlayerSource = function() {
            return this.mPlayerSource;
        };
        this.getCurrentPlayerSource = function() {
            return this.mCurPlaySrc;
        };
        this.setCurrentPlayerSource = function(arg) {
            return this.mCurPlaySrc = arg;
        };
        this.createActiveX = function(bv, bi, bp2p, name, w, h, uincn, keycn, dl) {
            try {
                this.mPlayerName = FM.createBPlayer();
                if (!this.mPlayerName) {
                    return false;
                }
            } catch(e) {
                FM.console.print("createActiveX exp:" + e.message);
            }
            return "";
        };
        this.initialize = function() {
            try {
                if (!this.checkPlayer()) {
                    return false;
                }
                this.mP2P = true;
                this.mSyncStatus = true;
                this.mInstall = true;
                this.mExistTime = 5;
                var oPlayer = this.mPlayerName;
                if (!oPlayer) {
                    return false;
                }
                FM.EventPlayer(oPlayer, "OnInitialized", g_playerCallback.OnInitialized);
                FM.EventPlayer(oPlayer, "OnUninitialized", g_playerCallback.OnUnitialized);
                FM.EventPlayer(oPlayer, "OnStateChanged", g_playerCallback.OnStateChanged);
                FM.EventPlayer(oPlayer, "OnPlayProgress", g_playerCallback.OnPlayProgress);
                FM.EventPlayer(oPlayer, "OnPlayError", g_playerCallback.OnPlayError);
                FM.EventPlayer(oPlayer, "OnDnldProgress", g_playerCallback.OnDownloadProgress);
                FM.EventPlayer(oPlayer, "OnPlaySrcChanged", g_playerCallback.OnPlaySrcChanged);
                this.mPlayerName.Initialize();
                this.mPlayerSource = "feeds_player_2011" + "_" + new Date().getTime();
                if (FM.getCookie("radio").split("|")[0] == FM.getLoginUin() && FM.compareVer(this.plv, "8.5.2011.228") >= 0) {
                    FM.console.print("createActiveX 3");
                    this.mPlayerName.SetRef( - 1);
                    var tmpSrc = FM.getCookie("radio").split("|");
                    if (tmpSrc.length > 1) {
                        this.mPlayerSource = tmpSrc[1];
                    }
                }
                this.mPlayerName.PlaySrc = this.mPlayerSource;
                this.mCurPlaySrc = this.mPlayerSource;
                var vol = FM.getCookie('fmvol') || 50;
                this.mPlayerName.Volume = vol;
            } catch(e) {
                FM.console.print("Qmp initialize exp:" + e.message);
                return false;
            }
            this.mIsInit = true;
            return true;
        };
        this.unInitialize = function() {
            try {
                var oPlayer = this.mPlayerName;
                FM.EventPlayerRemove(oPlayer, "OnInitialized", g_playerCallback.OnInitialized);
                FM.EventPlayerRemove(oPlayer, "OnUninitialized", g_playerCallback.OnUnitialized);
                FM.EventPlayerRemove(oPlayer, "OnStateChanged", g_playerCallback.OnStateChanged);
                FM.EventPlayerRemove(oPlayer, "OnPlayProgress", g_playerCallback.OnPlayProgress);
                FM.EventPlayerRemove(oPlayer, "OnPlayError", g_playerCallback.OnPlayError);
                FM.EventPlayerRemove(oPlayer, "OnDnldProgress", g_playerCallback.OnDownloadProgress);
                FM.EventPlayerRemove(oPlayer, "OnPlaySrcChanged", g_playerCallback.OnPlaySrcChanged);
                if ((this.mPlayerName).Uninitialize()) {
                    this.mIsInit = false;
                    return true;
                }
            } catch(e) {
                if (FM.debugMode) {
                    window.status = ("e 9 " + e.message);
                }
                return false;
            }
        };
        this.isInitialize = function() {
            return this.mIsInit;
        };
        this.getStatus = function() {
            if (!this.mIsInit) {
                return - 1;
            }
            var _s = -1;
            _s = this.mPlayerState;
            if (FM.compareVer(this.plv, "8.5.2011.228") >= 0) {
                _s = this.mPlayerName.GetCurState();
            }
            return _s;
        };
        this.setPlayURL = function(id, ul, stpt, iDuration, sSong, sSinger, sQzKey, iSongId, iSongType) {
            id = parseInt(id);
            var uin = FM.getCookie(FM.PANEL_UIN_COOKIE_NAME);
            var key = FM.getCookie(FM.PANEL_KEY_COOKIE_NAME);
            if (uin == "") {
                uin = FM.getCookie("uin").replace(/[^\d]/g, "");
            };
            if (key == "") {
                key = FM.getCookie("skey");
            };
            this.setUserIdent(uin != "" ? uin: '12345678', key != "" ? key: '12345678', this.mFromTag);
            if (!this.mIsInit) {
                return;
            }
            if (((ul == null) || (ul == "")) && (id < 0)) {
                return;
            }
            var tpp = 0;
            if (this.mP2P) {
                tpp = 1;
            }
            iSongId = iSongId || 0;
            iSongType = iSongType || 0;
            this.mPlayUrl = ul;
            this.mPlayBeginTime = new Date().getTime();
            FM.checkBuffering();
            if (ul.indexOf("qqmusic.qq.com") < 0) {
                stpt = "";
            }
            if (id <= 0) {
                stpt = "";
                this.setPlayParams(id, ul);
                this.mPlayingPos = this.mPlayList.getPos(ul);
                this.mPlayerName.SetPlayURL(id, ul, stpt);
                this.mPlayList.addObject(id, ul, stpt, 0, sSong, sSinger, "", iSongId, iSongType);
            } else {
                this.setPlayParams(id, ul);
                this.mPlayingPos = this.mPlayList.getPosById(id);
                this.mPlayerName.SetPlayURL(id, ul, stpt);
                this.mPlayList.addObject(id, ul, stpt, 0, sSong, sSinger, "", iSongId, iSongType);
            }
            return;
        };
        this.setPlayList = function() {};
        this.resetCache = function() {};
        this.isPlaying = function() {
            if (!this.mIsInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_PLAYING) || (_s == FM.S_BUFFERING) || (_s == FM.S_PLAYBEGIN));
        };
        this.isPause = function() {
            if (!this.mIsInit) {
                return false;
            }
            var _s = this.mPlayerState;
            return (_s == FM.S_PAUSE);
        };
        this.lastBufTime = 0;
        this.isStop = function() {
            if (!this.mIsInit) {
                return false;
            }
            var _s = this.mPlayerState;
            if (_s == FM.S_BUFFERING) {
                var cur = new Date().getTime();
                if (cur - this.lastBufTime > 1000 * 60) {
                    this.lastBufTime = new Date().getTime();
                }
                if (cur - this.lastBufTime > 1000 * 20) {
                    this.lastBufTime = new Date().getTime();
                    return true;
                }
            } else {
                this.lastBufTime = 0;
            }
            return ((_s == FM.S_STOP) || (_s == FM.S_PLAYEND));
        };
        this.getCurrentMusic = function() {
            if (this.mPlayingPos < 0) {
                return null;
            }
            return this.mPlayList.getObject(this.mPlayingPos);
        };
        this.runPlayerForce = function(pos) {
            try {
                FM.pauseFromApp = false;
                var obj = this.mPlayList.getObject(0);
                this.setPlayURL(obj.mId, obj.mPlayURL, obj.mTorrentURL, obj.mDuration, obj.mSongName, obj.mSingerName, obj.mQzoneKey);
            } catch(e) {}
        };
        this.runPlayerPos = function(pos) {
            if (this.isPause()) {
                this.startPlayer();
            } else if (pos >= 0 && pos < this.mPlayList.getCount()) {
                var obj = this.mPlayList.getObject(pos);
                this.setPlayURL(obj.mId, obj.mPlayURL, obj.mTorrentURL, obj.mDuration, obj.mSongName, obj.mSingerName, obj.mQzoneKey);
            }
        };
        this.runPlayer = function(ul) {
            if (!this.mIsInit) {
                return;
            }
            if (this.isPause()) {
                this.startPlayer();
            } else if (this.mPlayingPos < 0 && this.mPlayList.getCount() > 0) {
                this.mPlayingPos = 0;
                var obj = this.mPlayList.getObject(0);
                this.setPlayURL(obj.mId, obj.mPlayURL, obj.mTorrentURL, obj.mDuration, obj.mSongName, obj.mSingerName, obj.mQzoneKey);
            } else {
                this.startPlayer();
            }
            var strPatch = /qqmusic.qq.com/i;
            var tpos = this.mPlayingPos + 1;
            if (tpos > 0 && tpos < this.mPlayList.getCount()) {
                if (this.mPlayList.getObject(tpos).mPlayURL.search(strPatch)) { (this.mPlayerName).SetPrepareSong(this.mPlayList.getObject(tpos).mPlayURL, this.mPlayList.getObject(tpos).mTorrentURL);
                }
            }
            return;
        };
        this.startPlayer = function() {
            if (!this.mIsInit) {
                return false;
            }
            try { (this.mPlayerName).Play();
                return true;
            } catch(e) {
                FM.console.print("QQPlayer startPlayer exp: ", e.message);
            }
            return false;
        };
        this.stopPlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mIsInit) {
                return false;
            }
            try { (this.mPlayerName).Stop();
                return true;
            } catch(e) {
                if (FM.debugMode) {
                    window.status = ("e 12 " + e.message);
                }
            }
            return false;
        };
        this.pausePlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mIsInit) {
                return false;
            }
            try { (this.mPlayerName).Pause();
            } catch(e) {
                FM.console.print("QQMusic player pausePlayer exp :", e.message);
            }
        };
        this.setMute = function(isMute) {
            if (!this.mIsInit) {
                return false;
            }
            var bSet = 0;
            if (arguments.length > 0) {
                bSet = isMute ? 1 : 0;
            } else {
                bSet = ((this.mPlayerName).Mute == 1 ? 0 : 1);
            } (this.mPlayerName).Mute = bSet;
            return bSet;
        };
        this.getMute = function() {
            if (!this.mIsInit) {
                return false;
            }
            var bSet = ((this.mPlayerName).Mute == 1 ? true: false);
            return bSet;
        };
        this.getVolumn = function() {
            if (!this.mIsInit) {
                return 0;
            }
            return (this.mPlayerName).Volume;
        };
        this.setVolumn = function(vol) {
            if (!this.mIsInit) {
                return false;
            }
            if ((this.mPlayerName).Mute == 1) {
                return false;
            }
            if (vol > 100) {
                vol = 100;
            }
            if (vol < 0) {
                vol = 0;
            }
            if (vol >= 0 && vol <= 100) { (this.mPlayerName).Volume = vol;
            }
            return true;
        };
        this.quickPlayer = function(pos) {
            if (!this.mIsInit) {
                return false;
            }
            if (!this.isPlaying()) {
                return false;
            }
            var curr = (this.mPlayerName).CurPos;
            curr = curr + pos;
            if (curr <= 0) {
                return false;
            } (this.mPlayerName).CurPos = curr;
            return true;
        };
        this.lastPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return - 1;
            }
            this.mPlayingPos = this.mPlayingPos - 1;
            if ((this.mPlayingPos < 0) || (this.mPlayingPos >= this.mPlayList.getCount())) {
                this.mPlayingPos = 0;
            }
            var obj = this.mPlayList.getObject(this.mPlayingPos);
            this.setPlayURL(obj.mId, obj.mPlayURL, obj.mTorrentURL, obj.mDuration, obj.mSongName, obj.mSingerName, obj.mQzoneKey);
            return this.mPlayingPos;
        };
        this.nextPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return - 1;
            }
            this.mPlayingPos = this.mPlayingPos + 1;
            if ((this.mPlayingPos >= this.mPlayList.getCount()) || (this.mPlayingPos < 0)) {
                this.mPlayingPos = 0;
            }
            var obj = this.mPlayList.getObject(this.mPlayingPos);
            this.setPlayURL(obj.mId, obj.mPlayURL, obj.mTorrentURL, obj.mDuration, obj.mSongName, obj.mSingerName, obj.mQzoneKey);
            var strPatch = /qqmusic.qq.com/i;
            var tpos = this.mPlayingPos + 1;
            if (tpos > 0 && tpos < this.mPlayList.getCount()) {
                if (this.mPlayList.getObject(tpos).mPlayURL.search(strPatch)) { (this.mPlayerName).SetPrepareSong(this.mPlayList.getObject(tpos).mPlayURL, this.mPlayList.getObject(tpos).mTorrentURL);
                }
            }
            return this.mPlayingPos;
        };
        this.setUserIdent = function(iUin, sKey, iFromTag) {
            this.mUinCookie = iUin;
            this.mKeyCookie = sKey;
            this.mFromTag = iFromTag + "";
        };
    }
    FM.getCurPlaySongInfo = function() {
        var obj = FM.getPlayer();
        if (!obj) {
            return {};
        }
        if (obj.mPlayList.getCount() > 0) {
            var curPos = (obj.mPlayingPos >= 0 && obj.mPlayingPos < obj.mPlayList.getCount() ? obj.mPlayingPos: 0);
            return obj.mPlayList.getObject(curPos);
        }
    }
    FM.checkBuffering = function() {}
    FM.g_songPlayLen = 0;
    FM.insertH5AudioPlayer = function(objAttrs) {
        FM.playerDiv = FM.getElementInBody("h5audio_media_con_fm", "div");
        var html = [];
        html.push("<audio ");
		for (var key in objAttrs) {
            html.push(key);
            html.push("='");
            html.push(objAttrs[key]);
            html.push("' ");
        }
        html.push("></audio>");
        FM.playerDiv.innerHTML = html.join("");
        return FM.playerDiv.firstChild;
    }
    FM.createH5AudioPlayer = function() {
        return FM.insertH5AudioPlayer({
            id: 'h5audio_media_fm',
            height: 0,
            width: 0,
            autoplay: 'false'
        });
    }
    var S_UNDEFINE = 0,
    S_STOP = 1,
    S_PAUSE = 2,
    S_PLAYING = 3,
    S_BUFFERING = 4,
    S_PLAYBEGIN = 5,
    S_PLAYEND = 6;
    FM.H5AudioPlayer = function(fromTag) {
        this.mCurPlayPos = 0;
        this.mPlayerName = "";
        this.mPlayerSrc = "";
        this.mInit = false;
        this.mMute = false;
        this.mPlayList = new FM.PlayerListManager();
        this.mPlayingPos = -1;
        this.mVisible = true;
        this.mInstall = true;
        this.mDLLink = "";
        this.mUinCookie = 0;
        this.mKeyCookie = "";
        this.mUinCookieName = "";
        this.mKeyCookieName = "";
        this.mFromTag = fromTag || (FM.isPengyou ? 28 : 22);
        this.mRandomPlay = false;
        this.mPlayerState = 0;
        this._clientPlatform = false;
        this.firstPlay = true;
        this.mSetedCookie = false;
        this.isiPadLoad = 0;
        this.bereload = true;
        this.mPlayUrl = "";
        this.mPlayBeginTime = 0;
        this.setPlayerState = function(status) {
            this.mPlayerState = status;
        }
        this._checkClientPlatform = function() {
            var pl = navigator.platform.toLowerCase();
            var ipad = pl.match(/ipad/);
            if (ipad) {
                this._clientPlatform = "ipad";
                return true;
            }
            var iphone = pl.match(/iphone/);
            if (iphone) {
                this._clientPlatform = "iphone";
                return true;
            }
            var ipod = pl.match(/ipod/);
            if (ipod) {
                this._clientPlatform = "ipod";
                return true;
            }
            var win = pl.match(/win/);
            if (win) {
                this._clientPlatform = "win";
                return false;
            } else {
                this._clientPlatform = "not win";
                return true;
            }
            return false;
        }
        this.setUserIdent = function(iUin, sKey, iFromTag) {
            this.mUinCookie = iUin;
            this.mKeyCookie = sKey;
        };
        this.setMusicCookie = function() {
            if (this._checkClientPlatform()) {
                var uin = FM.getCookie("qqmusic_uin");
                var key = FM.getCookie("qqmusic_key");
                if (uin == "") {
                    uin = FM.getCookie("uin").replace(/[^\d]/g, "");
                };
                if (key == "") {
                    key = FM.getCookie("skey");
                };
                this.setUserIdent(uin != "" ? uin: '12345678', key != "" ? key: '12345678', this.mFromTag);
                FM.setCookie("qqmusic_uin", uin);
                FM.setCookie("qqmusic_key", key);
				FM.setCookie("qqmusic_fromtag", this.mFromTag);
                this.mSetedCookie = true;
            } else {
                this.mPlayerName.setAttribute("src", "http://qzone-music.qq.com/fcg-bin/fcg_set_musiccookie.fcg?fromtag=" + this.mFromTag + "&p=" + Math.random());
                this.mPlayerName.load();
                this.mPlayerName.play();
            }
        };
        this.checkPlayer = function(dl) {
            var obj = this.mPlayerName;
            if (!obj) {
                return false;
            }
            return true;
        };
        this.createActiveX = function(bv, bi, name, w, h, uincn, keycn, dl) {
            this.mPlayerName = FM.createH5AudioPlayer();
            this.mVisible = bv;
            this.mInstall = bi;
            this.mUinCookieName = uincn;
            this.mKeyCookieName = keycn;
            this.mDLLink = dl;
            return "";
        };
        this.initialize = function() {
            try {
                if (!this.checkPlayer()) {
                    if (this.mInstall) {
                        alert("对不起，您的浏览器不支持HTML5 音频播放！");
                        window.location = this.mDLLink;
                    }
                    return false;
                }
                this.setMusicCookie();
                this.mInit = true;
                this.bindPlayEvent();
                return true;
            } catch(e) {
                return false;
            }
        };
        this.isInitialize = function() {
            return this.mInit;
        };
        this.getStatus = function() {
            if (!this.mInit) {
                return - 1;
            }
            return this.mPlayerName.getAttribute("state");
        };
        this.getCurrentMusic = function() {
            if (this.mPlayingPos < 0) {
                return null;
            }
            return this.mPlayList.getObject(this.mPlayingPos);
        };
        this.runPlayerPos = function(pos) {
            if (pos >= 0 && pos < this.mPlayList.getCount()) {
                var curObj = this.mPlayList.getObject(pos);
                this.runPlayer(curObj.mPlayURL, curObj.mSongName, curObj.mSingerName, curObj.mSongId, curObj.mSongType);
            }
        };
        this.runPlayer = function(ul, name, singerName, iSongId, iSongType) {
            if (this.mSetedCookie) {
                if (window.idRunPlayer) {
                    clearTimeout(window.idRunPlayer);
                }
                this.realRunPlayer(ul, name, singerName, iSongId, iSongType);
            } else {
                window.idRunPlayer = setTimeout(function() {
                    FM.VH5Player.runPlayer(ul, name, singerName, iSongId, iSongType)
                },
                500);
            }
            return;
        };
        this.realRunPlayer = function(ul, name, singerName, iSongId, iSongType) {
            if (!this.mInit) {
                return;
            }
            var oplay = this.mPlayerName;
            this.bereload = true;
            if (this.isPause() && oplay.src == ul) {
                this.bereload = false;
            } else if ((ul != null) && (ul != "")) {
                oplay.setAttribute("src", ul);
                name = name || "";
                singerName = singerName || "";
                iSongId = iSongId || 0;
                iSongType = iSongType || 0;
                this.mPlayList.addObject(iSongId, ul, "", 0, name, singerName, "", iSongId, iSongType);
                this.mPlayingPos = this.mPlayList.getPos(ul);
            }
            if ((this.mPlayingPos < 0) && (this.mPlayList.getCount() > 0)) {
                this.mPlayingPos = 0;
                oplay.setAttribute("src", this.mPlayList.getObject(0).mPlayURL);
            }
            try {} catch(e) {}
            try {
                this.mPlayUrl = ul;
                this.mPlayBeginTime = new Date().getTime();
                FM.checkBuffering();
            } catch(e) {}
            if (this._checkClientPlatform() && this.firstPlay) {
                setTimeout(function() {
                    FM.VH5Player.startPlayer()
                },
                0);
                setTimeout(function() {
                    FM.VH5Player.startPlayer()
                },
                1000);
                this.firstPlay = false;
            } else {
                this.startPlayer();
            }
            return;
        };
        this.bindPlayEvent = function() {
            var oplay = (this.mPlayerName);
            var _this = this;
            EventUtil(oplay, "loadstart",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                oplay.setAttribute("state", g_playerStatus.S_BUFFERING);
                g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
                if (( !! ua.isiPad || !!ua.isiPhone) && oplay.isiPadLoad < 1) {
                    FM.VH5Player.isiPadLoad++;
                    g_playerCallback.OnStateChanged(g_playerStatus.S_PAUSE);
                }
            });
            EventUtil(oplay, "play",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                oplay.setAttribute("state", FM.S_PLAYBEGIN);
                g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYBEGIN);
            });
            EventUtil(oplay, "playing",
            function() {
                FM.clearCheckBuffering();
                var oplay = FM.VH5Player.mPlayerName;
                g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYING);
                oplay.setAttribute("state", FM.S_PLAYING);
            });
            EventUtil(oplay, "pause",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                g_playerCallback.OnStateChanged(g_playerStatus.S_PAUSE);
                oplay.setAttribute("state", FM.S_PAUSE);
            });
            EventUtil(oplay, "stalled",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                oplay.setAttribute("state", FM.S_STOP);
                g_playerCallback.OnStateChanged(g_playerStatus.S_STOP);
                if (oplay.getAttribute("src").indexOf('fcg_set_musiccookie') > -1) {
                    FM.VH5Player.mSetedCookie = true;
                }
            });
            EventUtil(oplay, "error",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                oplay.setAttribute("state", FM.S_STOP);
                if (oplay.getAttribute("src").indexOf('fcg_set_musiccookie') > -1) {
                    FM.VH5Player.mSetedCookie = true;
                }
                g_playerCallback.OnStateChanged(g_playerStatus.S_STOP);
                if (( !! ua.isiPad || !!ua.isiPhone) && oplay.error.code == 4) {
                    g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
                    FM.VH5Player.isiPadLoad = 0;
                } else {
                    var _obj = g_webPlayer.getSongInfoObj();
                    if ( !! _obj.mid && !!_obj.mstream && _obj.mid > 0 && _obj.mstream > 0) {} else if ( !! _obj.msongurl) {
                        alert('歌曲播放失败！您添加的网络歌曲，地址出错或被主人删除。');
                    }
                }
            });
            EventUtil(oplay, "ended",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYEND);
                oplay.setAttribute("state", FM.S_PLAYEND);
            });
            EventUtil(oplay, "timeupdate",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                var lCurPos = Math.floor(oplay.currentTime);
                var lTotal = Math.floor(oplay.duration);
                try {
                    g_playerCallback.OnPlayProgress(lCurPos, lTotal);
                    g_playerCallback.OnDownloadProgress(lCurPos, Math.ceil(oplay.buffered.end(0) * 100 / oplay.duration));
                } catch(e) {}
                if (lCurPos >= lTotal - 1) {
                    FM.VH5Player.stopPlayer();
                    oplay.setAttribute("state", FM.S_PLAYEND);
                    g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYEND);
                }
            });
            EventUtil(oplay, "loadedmetadata",
            function() {
                var oplay = FM.VH5Player.mPlayerName;
                if ( !! ua.safari && !( !! ua.isiPad || !!ua.isiPhone)) {
                    oplay.currentTime = 1;
                    oplay.play();
                }
            });
            EventUtil(oplay, "loadeddata",
            function() {});
            EventUtil(oplay, "canplay",
            function() {});
        }
        this.startPlayer = function() {
            var oplay = (this.mPlayerName);
            try {
                if (this.bereload) {
                    oplay.load();
                }
                oplay.play();
            } catch(e) {
                if (debugMode) {
                    status = ("e 2 " + e.message);
                }
            }
            return false;
        };
        this.stopPlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mInit) {
                return false;
            }
            if ((!this.isPlaying()) && (!this.isPause())) {
                return false;
            }
            try {
                var oplay = this.mPlayerName;
                oplay.pause();
                oplay.setAttribute("src", "");
            } catch(e) {
                if (debugMode) {
                    status = ("e 3 " + e.message);
                }
            }
            return true;
        };
        this.pausePlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mInit) {
                return false;
            }
            try {
                var oplay = this.mPlayerName;
                oplay.pause();
            } catch(e) {
                if (debugMode) {
                    status = ("e 4 " + e.message);
                }
            }
            return true;
        };
        this.isPlaying = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_PLAYING) || (_s == FM.S_BUFFERING) || (_s == FM.S_PLAYBEGIN));
        };
        this.isPause = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return (_s == FM.S_PAUSE || this.mPlayerName.paused);
        };
        this.isStop = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_STOP) || this.mPlayerName.ended || (_s == FM.S_MEDIAEND) || (_s == FM.S_UNDEFINE) || (_s == FM.S_READY));
        };
        this.setMute = function() {
            if (!this.mInit) {
                return false;
            }
            var oplay = this.mPlayerName;
            if (oplay.muted) {
                oplay.muted = false;
            } else {
                oplay.muted = true;
            }
            return true;
        };
        this.getVolumn = function() {
            if (!this.mInit) {
                return 0;
            }
            return (this.mPlayerName).volume * 100;
        };
        this.setVolumn = function(vol) {
            if (!this.mInit) {
                return false;
            }
            var oplay = (this.mPlayerName);
            if (oplay.muted) {
                return false;
            }
            if (vol > 100) {
                vol = 100;
            }
            if (vol < 0) {
                vol = 0;
            }
            if (vol >= 0 && vol <= 100) {
                oplay.volume = vol / 100;
            }
            return true;
        };
        this.quickPlayer = function(pos) {
            if (!this.mInit) {
                return false;
            }
            if (!this.isPlaying()) {
                return false;
            }
            var oplay = this.mPlayerName;
            if ((oplay.currentTime + pos) >= oplay.duration) {
                return false;
            }
            if ((oplay.currentTime + pos) <= 0) {
                return false;
            }
            oplay.currentTime += pos;
            return true;
        };
        this.lastPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return;
            }
            this.mPlayingPos = this.mPlayingPos - 1;
            if ((this.mPlayingPos < 0) || (this.mPlayingPos >= this.mPlayList.getCount())) {
                this.mPlayingPos = this.mPlayList.getCount() - 1;
            }
            var curObj = this.mPlayList.getObject(this.mPlayingPos);
            this.runPlayer(curObj.mPlayURL, curObj.mSongName, curObj.mSingerName, curObj.mSongId, curObj.mSongType);
            return this.mPlayingPos;
        };
        this.nextPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return - 1;
            }
            this.mPlayingPos = this.mPlayingPos + 1;
            if ((this.mPlayingPos >= this.mPlayList.getCount()) || (this.mPlayingPos < 0)) {
                this.mPlayingPos = 0;
            }
            var curObj = this.mPlayList.getObject(this.mPlayingPos);
            this.runPlayer(curObj.mPlayURL, curObj.mSongName, curObj.mSingerName, curObj.mSongId, curObj.mSongType);
            return this.mPlayingPos;
        };
        this.setBalance = function() {};
        this.getErrorMsg = function() {
            var errorDesc = this.mPlayerName.error.item(0).errorDescription;
            return errorDesc;
        };
        this.printPlayList = function() {
            var list = "";
            for (var i = this.mPlayList.getCount(); i > 0; i--) {
                list = list + "第[" + i + "]" + "播放记录:" + this.mPlayList.getObject(i - 1).mPlayURL + "\n";
            }
            return list;
        };
    }
    window.g_flashPlayer = window.g_flashPlayer || {};
    g_flashPlayer.swfReady = false;
    g_flashPlayer.swfInitComplete = function() {
        g_flashPlayer.swfReady = true;
    };
    FM.insertFlashPlayer = function() {
        FM.playerDiv = FM.getElementInBody("flash_media_con_fm", "div");
        FM.playerDiv.innerHTML = FM.media.getFlashHtml({
            width: 1,
            height: 1,
            src: 'http://imgcache.qq.com/music/miniplayer/MusicPlayer.swf',
            quality: 'high',
            wmode: 'transparent',
            id: "flashMusicPlayerFm",
            name: "flashMusicPlayer",
            allowScriptAccess: 'always'
        },
        '7,0,0,0');
        return FM.playerDiv.firstChild;
    }
    FM.createFlashPlayer = function() {
        return FM.insertFlashPlayer();
    }
    FM.flashPlayState = {
        0 : S_STOP,
        1 : S_PLAYBEGIN,
        2 : S_PLAYING,
        3 : S_PAUSE,
        4 : S_BUFFERING,
        5 : S_PLAYEND
    };
    FM.FlashMusicPlayer = function(fromTag) {
        this.mCurPlayPos = 0;
        this.mPlayerName = "";
        this.mPlayerSrc = "";
        this.mInit = false;
        this.mMute = false;
        this.mPlayList = new FM.PlayerListManager();
        this.mPlayingPos = -1;
        this.mVisible = true;
        this.mInstall = true;
        this.mDLLink = "";
        this.mUinCookie = 0;
        this.mKeyCookie = "";
        this.mUinCookieName = "";
        this.mKeyCookieName = "";
        this.mFromTag = fromTag || (FM.isPengyou ? 28 : 22);
        this.mRandomPlay = false;
        this.mPlayerState = 0;
        this._clientPlatform = false;
        this.firstPlay = true;
        this.mSetedCookie = false;
        this.bereload = true;
        this.mPlayUrl = "";
        this.mPlayBeginTime = 0;
        this.setPlayerState = function(status) {
            this.mPlayerState = status;
        }
        this._checkClientPlatform = function() {
            var pl = navigator.platform.toLowerCase();
            var ipad = pl.match(/ipad/);
            if (ipad) {
                this._clientPlatform = "ipad";
                return true;
            }
            var iphone = pl.match(/iphone/);
            if (iphone) {
                this._clientPlatform = "iphone";
                return true;
            }
            var ipod = pl.match(/ipod/);
            if (ipod) {
                this._clientPlatform = "ipod";
                return true;
            }
            var win = pl.match(/win/);
            if (win) {
                this._clientPlatform = "win";
                return false;
            } else {
                this._clientPlatform = "not win";
                return true;
            }
            return false;
        }
        this.setUserIdent = function(iUin, sKey, iFromTag) {
            this.mUinCookie = iUin;
            this.mKeyCookie = sKey;
        };
        this.realSetMusicCookie = function() {
            var uin = FM.getCookie("qqmusic_uin");
            var key = FM.getCookie("qqmusic_key");
            if (uin == "") {
                uin = FM.getCookie("uin").replace(/[^\d]/g, "");
            };
            if (key == "") {
                key = FM.getCookie("skey");
            };
            this.setUserIdent(uin != "" ? uin: '12345678', key != "" ? key: '12345678', this.mFromTag);
            FM.setCookie("qqmusic_uin", uin);
            FM.setCookie("qqmusic_key", key);
			FM.setCookie("qqmusic_fromtag", this.mFromTag);
            this.mPlayUrl = "http://qzone-music.qq.com/fcg-bin/fcg_set_musiccookie.fcg?fromtag=" + this.mFromTag + "&p=" + Math.random();
            this.mPlayerName.swfPlayMusic(this.mPlayUrl, 5);
            setTimeout(function() {
                FM.VFlashPlayer.mSetedCookie = true;
            },
            3000);
        }
        this.setMusicCookie = function() {
            if (g_flashPlayer.swfReady) {
                if (window.idSetMusicCookie) {
                    clearTimeout(window.idSetMusicCookie);
                }
                this.realSetMusicCookie();
            } else {
                window.idSetMusicCookie = setTimeout(function() {
                    FM.VFlashPlayer.setMusicCookie()
                },
                500);
            }
        };
        this.checkPlayer = function(dl) {
            var obj = this.mPlayerName;
            if (!obj) {
                return false;
            }
            return true;
        };
        this.createActiveX = function(bv, bi, name, w, h, uincn, keycn, dl) {
            this.mPlayerName = FM.createFlashPlayer();
            this.mVisible = bv;
            this.mInstall = bi;
            this.mUinCookieName = uincn;
            this.mKeyCookieName = keycn;
            this.mDLLink = dl;
            return "";
        };
        this.initialize = function() {
            try {
                if (!this.checkPlayer()) {
                    if (this.mInstall) {
                        alert("对不起，您的浏览器不支持flash音频播放！");
                    }
                    return false;
                }
                this.setMusicCookie();
                this.mInit = true;
                try {} catch(e) {};
                this.bindPlayEvent();
                return true;
            } catch(e) {
                return false;
            }
        };
        this.isInitialize = function() {
            return this.mInit;
        };
        this.getStatus = function() {
            if (!this.mInit) {
                return - 1;
            }
            return FM.flashPlayState[this.mPlayerName.swfGetPlayStat()];
        };
        this.getCurrentMusic = function() {
            if (this.mPlayingPos < 0) {
                return null;
            }
            return this.mPlayList.getObject(this.mPlayingPos);
        };
        this.runPlayerPos = function(pos) {
            if (pos >= 0 && pos < this.mPlayList.getCount()) {
                var curObj = this.mPlayList.getObject(pos);
                this.runPlayer(curObj.mPlayURL, curObj.mSongName, curObj.mSingerName, curObj.mSongId, curObj.mSongType);
            }
        };
        this.runPlayer = function(ul, name, singerName, iSongId, iSongType) {
            if (g_flashPlayer.swfReady && this.mSetedCookie) {
                if (window.idRunPlayer) {
                    clearTimeout(window.idRunPlayer);
                }
                this.realRunPlayer(ul, name, singerName, iSongId, iSongType);
            } else {
                window.idRunPlayer = setTimeout(function() {
                    FM.VFlashPlayer.runPlayer(ul, name, singerName, iSongId, iSongType)
                },
                500);
            }
            return;
        };
        this.realRunPlayer = function(ul, name, singerName, iSongId, iSongType) {
            if (!this.mInit) {
                return;
            }
            var oplay = this.mPlayerName;
            this.bereload = true;
            if (this.isPause() && this.mPlayUrl == ul) {
                this.bereload = false;
            } else if ((ul != null) && (ul != "")) {
                oplay.swfPlayMusic(ul, 5);
                name = name || "";
                singerName = singerName || "";
                iSongId = iSongId || 0;
                iSongType = iSongType || 0;
                this.mPlayList.addObject(iSongId, ul, "", 0, name, singerName, "", iSongId, iSongType);
                this.mPlayingPos = this.mPlayList.getPos(ul);
            }
            if ((this.mPlayingPos < 0) && (this.mPlayList.getCount() > 0)) {
                this.mPlayingPos = 0;
                oplay.swfPlayMusic(this.mPlayList.getObject(0).mPlayURL, 5);
            }
            try {
                this.mPlayUrl = ul;
                this.mPlayBeginTime = +new Date();
                FM.checkBuffering();
            } catch(e) {}
            this.startPlayer();
            return;
        };
        this.bindPlayEvent = function() {
            window.g_flashPlayer = window.g_flashPlayer || {};
            g_flashPlayer.soundStatChange = function(dataObj) {
                FM.console.print("dataObj.playStat:", dataObj.playStat, "realStat:", FM.flashPlayState[dataObj.playStat]);
                if (FM.VFlashPlayer.mPlayUrl.indexOf('fcg_set_musiccookie') > -1) {
                    FM.VFlashPlayer.mSetedCookie = true;
                }
                g_playerCallback.OnStateChanged(FM.flashPlayState[dataObj.playStat]);
            };
            g_flashPlayer.soundData = function(dataObj) {
                g_playerCallback.OnPlayProgress(dataObj.position, FM.VFlashPlayer.mPlayerName.swfGetTotalTime());
                g_playerCallback.OnDownloadProgress(0, dataObj.progress);
            };
            g_flashPlayer.soundIOError = function(msg) {
                FM.clearCheckBuffering();
                if (FM.VFlashPlayer.mPlayUrl.indexOf('fcg_set_musiccookie') > -1) {
                    FM.VFlashPlayer.mSetedCookie = true;
                }
                g_playerCallback.OnStateChanged(g_playerStatus.S_STOP);
                FM.console.print("playError:", msg);
            };
        }
        this.startPlayer = function() {
            var oplay = (this.mPlayerName);
            try {
                oplay.swfPlayMusic();
            } catch(e) {
                FM.console.print("flash player startPlayer exp : ", e.message);
            }
            return false;
        };
        this.stopPlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mInit) {
                return false;
            }
            if ((!this.isPlaying()) && (!this.isPause())) {
                return false;
            }
            try {
                var oplay = this.mPlayerName;
                oplay.swfStopMusic();
            } catch(e) {
                FM.console.print("flash player stopPlayer exp : ", e.message);
            }
            return true;
        };
        this.pausePlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mInit) {
                return false;
            }
            try {
                var oplay = this.mPlayerName;
                oplay.swfPauseMusic();
            } catch(e) {
                FM.console.print("flash player pausePlayer  exp : ", e.message);
            }
            return true;
        };
        this.isPlaying = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_PLAYING) || (_s == FM.S_BUFFERING) || (_s == FM.S_PLAYBEGIN));
        };
        this.isPause = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return (_s == FM.S_PAUSE);
        };
        this.isStop = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_STOP) || (_s == FM.S_MEDIAEND) || (_s == FM.S_UNDEFINE) || (_s == FM.S_READY));
        };
        this.setMute = function(isMute) {
            if (!this.mInit) {
                return false;
            }
            isMute = isMute || false;
            var oplay = this.mPlayerName;
            if (!isMute && oplay.swfGetMute()) {
                oplay.swfSetMute(false);
            } else {
                oplay.swfSetMute(true);
            }
            return true;
        };
        this.getVolumn = function() {
            if (!this.mInit) {
                return 0;
            }
            return (this.mPlayerName).swfGetVolume();
        };
        this.setVolumn = function(vol) {
            if (!this.mInit) {
                return false;
            }
            var oplay = (this.mPlayerName);
            if (oplay.swfGetMute()) {
                return false;
            }
            if (vol > 100) {
                vol = 100;
            }
            if (vol < 0) {
                vol = 0;
            }
            if (vol >= 0 && vol <= 100) {
                oplay.swfSetVolume(vol);
            }
            return true;
        };
        this.quickPlayer = function(pos) {
            if (!this.mInit) {
                return false;
            }
            var oplay = this.mPlayerName,
            quickPos = (oplay.swfGetPosion() + pos);
            if (quickPos >= oplay.swfGetTotalTime() || quickPos <= 0) {
                return false;
            }
            oplay.swfSeekMusic(quickPos);
            return true;
        };
        this.lastPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return;
            }
            this.mPlayingPos = this.mPlayingPos - 1;
            if ((this.mPlayingPos < 0) || (this.mPlayingPos >= this.mPlayList.getCount())) {
                this.mPlayingPos = this.mPlayList.getCount() - 1;
            }
            var curObj = this.mPlayList.getObject(this.mPlayingPos);
            this.runPlayer(curObj.mPlayURL, curObj.mSongName, curObj.mSingerName, curObj.mSongId, curObj.mSongType);
            return this.mPlayingPos;
        };
        this.nextPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return - 1;
            }
            this.mPlayingPos = this.mPlayingPos + 1;
            if ((this.mPlayingPos >= this.mPlayList.getCount()) || (this.mPlayingPos < 0)) {
                this.mPlayingPos = 0;
            }
            var curObj = this.mPlayList.getObject(this.mPlayingPos);
            this.runPlayer(curObj.mPlayURL, curObj.mSongName, curObj.mSingerName, curObj.mSongId, curObj.mSongType);
            return this.mPlayingPos;
        };
        this.setBalance = function() {};
        this.getErrorMsg = function() {
            return "";
        };
    }
    FM.insertMediaPlayer = function(wmpArguments, cid) {
        var params = [];
        var objArgm = [];
        if (typeof(cid) == 'undefined') {
            cid = "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6";
        }
        for (var k in wmpArguments) {
            switch (k) {
            case "id":
            case "width":
            case "height":
            case "style":
                objArgm.push(k + '="' + wmpArguments[k] + '" ');
                break;
            case "src":
                objArgm.push(k + '="' + wmpArguments[k] + '" ');
                break;
            default:
                objArgm.push(k + '="' + wmpArguments[k] + '" ');
                params.push('<param name="' + k + '" value="' + wmpArguments[k] + '" />');
            }
        }
        if (wmpArguments["src"]) {
            params.push('<param name="URL" value="' + wmpArguments["src"] + '" />');
        }
        if ( !! ua.ie) {
            return '<object classid="' + cid + '" ' + objArgm.join("") + '>' + params.join("") + '</object>';
        } else {
            return '<object  type="application/x-ms-wmp" ' + objArgm.join("") + '></object>';
        }
    }
    FM.insertWMP = function(args) {
        FM.playerDiv = FM.getElementInBody("wm_control_fm", "div");
        FM.playerDiv.innerHTML = FM.insertMediaPlayer(args);
        return FM.playerDiv.firstChild;
    }
    FM.createMediaPlayer = function() {
        return FM.insertWMP({
            id: 'wmplayer',
            height: 0,
            width: 0,
            autoStart: 'false',
            invokeURLs: 'false',
            uiMode: 'invisible',
            enablePositionControls: 'true',
            canScan: 'true',
            canSeek: 'true'
        });
    }
    FM.gotoDownLoadWmp = function() {
        updateDownloadPlayer();
    }
    FM.openWmpDownload = function() {
        if (! (ua.ie)) {
            FM.MyOpenwin("http://cache.music.soso.com/sosocache/music/player/wmpfirefoxplugin.exe", "_blank");
        } else {
            FM.MyOpenwin("http://cache.music.soso.com/sosocache/music/player/wmp11-windowsxp-x86-enu.zip", "_blank");
        }
    }
    FM.WMPlayer = function() {
        this.mCurPlayPos = 0;
        this.mPlayerName = "";
        this.mInit = false;
        this.mMute = false;
        this.mPlayList = new FM.PlayerListManager();
        this.mRandomPlay = false;
        this.mPlayerState = FM.S_UNDEFINE;
        this.mPlayingPos = -1;
        this.mVisible = true;
        this.mInstall = true;
        this.mDLLink = "";
        this.mUinCookie = 0;
        this.mKeyCookie = "";
        this.mUinCookieName = "";
        this.mKeyCookieName = "";
        this.mFromTag = (FM.isPengyou ? 28 : 22);
        this.setPlayerState = function(status) {
            this.mPlayerState = status;
        }
        this.setUserIdent = function(iUin, sKey, iFromTag) {
            this.mUinCookie = iUin;
            this.mKeyCookie = sKey;
            this.mFromTag = iFromTag + "";
        };
        this.checkPlayer = function(dl) {
            var obj = (this.mPlayerName);
            if (!obj || !obj.controls) {
                return false;
            }
            return true;
        };
        this.createActiveX = function(bv, bi, name, w, h, uincn, keycn, dl) {
            this.mPlayerName = FM.createMediaPlayer();
            this.mVisible = bv;
            this.mInstall = bi;
            this.mUinCookieName = uincn;
            this.mKeyCookieName = keycn;
            this.mDLLink = dl;
            return "";
        };
        this.mSetedCookie = false;
        this.setMusicCookie = function() {
            this.mPlayerName.URL = "http://qzone-music.qq.com/fcg-bin/fcg_set_musiccookie.fcg?fromtag=" + this.mFromTag + "&p=" + Math.random();
            this.startPlayer();
            setTimeout(function() {
                FM.MediaPlayer.mSetedCookie = true;
            },
            3000);
        };
        this.initialize = function() {
            try {
                if (!this.checkPlayer()) {
                    if (this.mInstall) {
                        FM.gotoDownLoadWmp();
                    }
                    return false;
                }
                this.mPlayerName.invokeURLs = false;
                try {} catch(e) {};
                this.setMusicCookie();
                this.mInit = true;
                return true;
            } catch(e) {
                return false;
            }
        };
        this.unInitialize = function() {
            try {
                this.mIsInit = false;
                return true;
            } catch(e) {
                if (FM.debugMode) {
                    window.status = ("e 9 " + e.message);
                }
                return false;
            }
        };
        this.isInitialize = function() {
            return this.mInit;
        };
        this.getStatus = function() {
            if (!this.mInit) {
                return - 1;
            }
            return (this.mPlayerName).playState;
        };
        this.getCurrentMusic = function() {
            if (this.mPlayingPos < 0) {
                return null;
            }
            return this.mPlayList.getObject(this.mPlayingPos);
        };
        this.runPlayerPos = function(pos) {
            if (this.isPause()) {
                this.startPlayer();
            } else if (pos >= 0 && pos < this.mPlayList.getCount()) {
                this.runPlayer(this.mPlayList.getObject(pos).mPlayURL);
            }
        };
        this.runPlayer = function(ul, name, singerName, iSongId, iSongType) {
            if (FM.MediaPlayer.mSetedCookie) {
                if (window.idRunPlayer) {
                    clearTimeout(window.idRunPlayer);
                }
                this.realRunPlayer(ul, name, singerName, iSongId, iSongType);
            } else {
                window.idRunPlayer = setTimeout(function() {
                    FM.MediaPlayer.runPlayer(ul, name, singerName, iSongId, iSongType)
                },
                1000);
            }
            return;
        };
        this.realRunPlayer = function(ul, name, singerName, iSongId, iSongType) {
            if (!this.mInit) {
                return;
            }
            var uin = FM.getCookie(FM.PANEL_UIN_COOKIE_NAME);
            var key = FM.getCookie(FM.PANEL_KEY_COOKIE_NAME);
            if (uin == "") {
                uin = FM.getCookie("uin").replace(/[^\d]/g, "");
            };
            if (key == "") {
                key = FM.getCookie("skey");
            };
            this.setUserIdent(uin != "" ? uin: '12345678', key != "" ? key: '12345678', this.mFromTag);
            FM.setCookie(FM.MUSIC_UIN_COOKIE_NAME, this.mUinCookie);
            FM.setCookie(FM.MUSIC_KEY_COOKIE_NAME, this.mKeyCookie);
            FM.setCookie("qqmusic_fromtag", this.mFromTag);
            var oplay = (this.mPlayerName);
            ul = ul || "";
            if (this.isPause() && (ul == "" || oplay.URL == ul)) {} else if ((ul != null) && (ul != "")) {
                oplay.URL = ul;
                name = name || "";
                singerName = singerName || "";
                iSongId = iSongId || 0;
                iSongType = iSongType || 0;
                this.mPlayList.addObject(iSongId, ul, "", 0, name, singerName, "", iSongId, iSongType);
                this.mPlayingPos = this.mPlayList.getPos(ul);
            }
            if ((this.mPlayingPos < 0) && (this.mPlayList.getCount() > 0)) {
                this.mPlayingPos = 0;
                oplay.URL = this.mPlayList.getObject(0).mPlayURL;
                this.startPlayer();
            }
            this.startPlayer();
        };
        this.startPlayer = function() {
            FM.checkBuffering();
            FM.loopCheckPlayer();
            var oplay = (this.mPlayerName);
            try {
                if (oplay.controls.isAvailable('play')) {
                    oplay.controls.play();
                }
            } catch(e) {}
            return false;
        };
        this.stopPlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mInit) {
                return false;
            }
            try {
                var oplay = (this.mPlayerName);
                if (oplay.controls.isAvailable('stop')) {
                    oplay.controls.stop();
                }
            } catch(e) {
                if (FM.debugMode) {
                    window.status = ("e 3 " + e.message);
                }
            }
            return true;
        };
        this.pausePlayer = function() {
            FM.clearCheckBuffering();
            if (!this.mInit) {
                return false;
            }
            try {
                var oplay = (this.mPlayerName);
                if (oplay.controls.isAvailable('pause')) {
                    oplay.controls.pause();
                }
            } catch(e) {
                if (FM.debugMode) {
                    window.status = ("e 4 " + e.message);
                }
            }
            return true;
        };
        this.isPlaying = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_PLAYING) || (_s == FM.S_BUFFERING_WMP));
        };
        this.isPause = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return (_s == FM.S_PAUSE);
        };
        this.isStop = function() {
            if (!this.mInit) {
                return false;
            }
            var _s = this.getStatus();
            return ((_s == FM.S_STOP) || (_s == S_MEDIAEND) || (_s == FM.S_UNDEFINE) || (_s == FM.S_READY));
        };
        this.setMute = function() {
            if (!this.mInit) {
                return false;
            }
            var oplay = (this.mPlayerName);
            if (oplay.settings.mute) {
                oplay.settings.mute = false;
            } else {
                oplay.settings.mute = true;
            }
            return true;
        };
        this.getVolumn = function() {
            if (!this.mInit) {
                return 0;
            }
            return (this.mPlayerName).settings.volume;
        };
        this.setVolumn = function(vol) {
            if (!this.mInit) {
                return false;
            }
            var oplay = (this.mPlayerName);
            if (oplay.settings.mute) {
                return false;
            }
            if (vol > 100) {
                vol = 100;
            }
            if (vol < 0) {
                vol = 0;
            }
            if (vol >= 0 && vol <= 100) {
                oplay.settings.volume = vol;
            }
            return true;
        };
        this.quickPlayer = function(pos) {
            if (!this.mInit) {
                return false;
            }
            if (!this.isPlaying()) {
                return false;
            }
            var oplay = (this.mPlayerName);
            if ((oplay.controls.currentPosition + pos) >= oplay.currentMedia.duration) {
                return false;
            }
            if ((oplay.controls.currentPosition + pos) <= 0) {
                return false;
            }
            oplay.controls.currentPosition += pos;
            return true;
        };
        this.lastPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return;
            }
            this.mPlayingPos = this.mPlayingPos - 1;
            if ((this.mPlayingPos < 0) || (this.mPlayingPos >= this.mPlayList.getCount())) {
                this.mPlayingPos = this.mPlayList.getCount() - 1;
            }
            this.runPlayer(this.mPlayList.getObject(this.mPlayingPos).mPlayURL);
            return this.mPlayingPos;
        };
        this.nextPlayer = function() {
            if (this.mPlayList.getCount() == 0) {
                return - 1;
            }
            this.mPlayingPos = this.mPlayingPos + 1;
            if ((this.mPlayingPos >= this.mPlayList.getCount()) || (this.mPlayingPos < 0)) {
                this.mPlayingPos = 0;
            }
            this.runPlayer(this.mPlayList.getObject(this.mPlayingPos).mPlayURL);
            return this.mPlayingPos;
        };
        this.setBalance = function() {
            var oplay = (this.mPlayerName);
            oplay.settings.balance = oplay.settings.balance == '100' ? '-100': '100';
            return (oplay.settings.balance == '100' ? '右声道': '左声道');
        };
        this.getErrorMsg = function() {
            var errorDesc = (this.mPlayerName).error.item(0).errorDescription;
            return errorDesc;
        };
    }
    String.prototype.entityReplace = function() {
        return this.replace(/&#38;?/g, "&amp;").replace(/&amp;/g, "&").replace(/&#(\d+);?/g,
        function(a, b) {
            return String.fromCharCode(b)
        }).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&nbsp;/g, " ").replace(/&#13;/g, "\n").replace(/(&#10;)|(&#x\w*;)/g, "").replace(/&amp;/g, "&");
    }
    FM.BrunPlayer = function(pos) {
        if (pos == null) {
            pos = -1;
        }
        var oPlayer = FM.getPlayer();
        if (!oPlayer) {
            return;
        }
        if (pos == -1) {
            var cPos = oPlayer.mPlayingPos;
            if (cPos > -1) {
                oPlayer.runPlayerPos(cPos);
            } else {
                oPlayer.runPlayer('');
            }
        } else {
            oPlayer.runPlayerPos(pos);
        }
    }
    FM.getPlayer = function() {
        return FM.bUseBQQPlayer && FM.BQQPlayer ? FM.BQQPlayer: ( !! FM.MediaPlayer ? FM.MediaPlayer: ( !! FM.VH5Player ? FM.VH5Player: ( !! FM.VFlashPlayer ? FM.VFlashPlayer: false)));
    }
    FM.BpausePlayer = function() {
        FM.getPlayer() && FM.getPlayer().pausePlayer();
    }
    FM.BstopPlayer = function() {
        FM.getPlayer() && FM.getPlayer().stopPlayer();
    }
    FM.BlastPlayer = function() {
        FM.getPlayer() && FM.getPlayer().lastPlayer();
    }
    FM.BnextPlayer = function() {
        FM.getPlayer() && FM.getPlayer().nextPlayer();
    }
    FM.BmutePlayer = function(isMute) {
        FM.getPlayer() && FM.getPlayer().setMute(isMute);
    }
    FM.getMute = function() {
        FM.getPlayer() && FM.getPlayer().getMute();
    }
    FM.Qmute = function(isMute) {
        FM.BmutePlayer(isMute);
    }
    FM.setVolumn = function(type) {
        FM.getPlayer() && FM.getPlayer().setVolumn(type);
    }
    FM.pauseFromApp = false;
    FM.pauseAppMusic = function() {
        try {
            FM.pauseFromApp = false;
            var w = MUSIC.pengyouWin;
            if (typeof(w) == "object" && w != null) {
                w.MUSIC.ICMusic.hideFlash();
            }
        } catch(e) {
            MUSIC.pengyouWin = null;
        }
    }
    FM.BQplay = function(pos) {
        FM.pauseAppMusic();
        if (FM.bqqplayer_play_flag != null) {
            FM.bqqplayer_play_flag = true;
        }
        if ( !! ua.safari || (ua && !!ua.chrome && !ua.tt >= 5)) {
            var html5Audio = FM.getPlayer();
            if (typeof html5Audio != "undefined") {
                html5Audio.bereload = false;
                html5Audio.startPlayer();
            }
        } else {
            FM.BrunPlayer(pos);
        }
    }
    FM.isQdo = function() {
        if (FM.bUseBQQPlayer && FM.BQQPlayer) {
            if (FM.BQQPlayer.getPlayerSource() == FM.BQQPlayer.getCurrentPlayerSource()) {
                return true;
            } else {
                return false;
            }
        } else {
            return true;
        }
    }
    FM.BQstop = function() {
        function realStop() {
            if (FM.bqqplayer_play_flag != null) {
                FM.bqqplayer_play_flag = false;
            }
            if (FM.idBAutoPlay) {
                clearTimeout(FM.idBAutoPlay);
            }
            FM.BstopPlayer();
        }
        FM.isQdo() && realStop();
    }
    FM.BQpause = function() {
        if (FM.isQdo()) {
            if (FM.idBAutoPlay) {
                clearTimeout(FM.idBAutoPlay);
            }
            FM.BpausePlayer();
        }
    }
    FM.BQnext = function() {
        FM.BnextPlayer();
    }
    FM.BQprevious = function() {
        FM.BlastPlayer();
    }
    FM.getExactQusicID = function(sPlayUrl) {
        if (sPlayUrl.indexOf("qqmusic.qq.com") < 0) {
            return 0;
        }
        var st = sPlayUrl.entityReplace();
        var sl = st.split("/");
        var sm = sl[sl.length - 1];
        var si = sm.split(".");
        return si[0] ? si[0] : 0;
    }
    FM.getQusicID = function(sPlayUrl) {
        var qusidt = Number(FM.getExactQusicID(sPlayUrl));
        if (isNaN(qusidt)) {
            qusidt = 0;
        }
        if (qusidt > 30000000) {
            qusidt -= 30000000;
        }
        if (qusidt > 12000000) {
            qusidt -= 12000000;
        }
        return qusidt;
    }
    FM.getLocalReportID = function(sPlayUrl) {
        return 0;
    }
    FM.getLocalUrl = function(sUrl, songId, uin) {
        return sUrl;
    }
    FM.getQusicURL = function(sPlayUrl) {
        var pos = sPlayUrl.indexOf("qqmusic.qq.com");
        if (pos != -1) {
            var qusidt = Number(FM.getExactQusicID(sPlayUrl));
            if (qusidt > 0 && qusidt < 12000000) {
                qusidt += 12000000;
            }
            sPlayUrl = sPlayUrl.substring(0, pos + 14) + "/" + qusidt + (qusidt > 30000000 ? ".mp3": ".wma");
        }
        return sPlayUrl;
    }
    FM.BclearPlayList = function() {
        FM.getPlayer() && FM.getPlayer().mPlayList.clearObject();
    }
    FM.URLencode = function(ss) {
        if (ss == "http://" || (ss.substring(0, 7) != "http://" && ss.substring(0, 6) != "mms://")) {
            return "";
        }
        return ss.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\'/g, "&apos;").replace(/\"/g, "&quot;").replace(/\r/g, "%0A").replace(/\n/g, "%0D").replace(/,/g, "%27");
    }
    FM.getStreamID = function(sPlayUrl) {
        var st = sPlayUrl;
        var sl = st.split("/");
        var sm = sl[2];
        var si = sm.split("m");
        return si[1] ? si[1] : 0;
    }
    FM.getQusicH5URL = function(sPlayUrl) {
        var pos = sPlayUrl.indexOf("qqmusic.qq.com");
        if (pos != -1) {
            var qusidt = Number(FM.getExactQusicID(sPlayUrl));
            if (qusidt > 0 && qusidt < 30000000) {
                if (qusidt > 12000000) {
                    qusidt -= 12000000;
                }
                qusidt += 30000000;
            }
            var streamId = parseInt(FM.getStreamID(sPlayUrl));
            streamId = (streamId < 11 ? streamId + 10 : streamId);
            sPlayUrl = "http://stream" + streamId + ".qqmusic.qq.com/" + qusidt + ".mp3";
        }
        return sPlayUrl;
    }
    FM.BplayOneSong = function(name, urlin, qusid, singerName, iSongId, iSongType) {
        try {
            if ( !! FM.isNeedUpdatePlayer) {
                updateDownloadPlayer();
                return;
            }
            var url = FM.trim(urlin).entityReplace().replace(/\[/g, "").replace(/\]/g, "");
            var regstr = new RegExp("&apos;", "g");
            url = FM.URLencode(url);
            name = name.replace(regstr, "\'");
            singerName = singerName || "";
            if (url.indexOf("music.qq.com") < 0) {
                qusid = 0;
            }
            iSongId = iSongId || qusid;
            var m = FM.tj2rp;
            iSongType = iSongType || m.getSongType(url); {
                m.statSong({
                    id: iSongId,
                    type: iSongType,
                    fromtag2: 602
                });
            }
            if (FM.bUseBQQPlayer) {
                FM.BQQPlayer.mPlayList.clearObject();
                var sTorrentURL = "";
                var strPatch = /qqmusic.qq.com/i;
                if (url.search(strPatch)) {
                    if (parseInt(qusid) > 0) {
                        url = FM.getQusicURL(url);
                        sTorrentURL = "http://tpt.music.qq.com/" + FM.getExactQusicID(url) + ".tpt";
                    } else {
                        sTorrentURL = "";
                    }
                }
                FM.BQQPlayer.setPlayURL(qusid, url, sTorrentURL, 0, name, singerName, "", iSongId, iSongType);
            } else {
                if (( !! ua.safari || (ua && !!ua.chrome)) && FM.VH5Player) {
                    FM.VH5Player.mPlayList.clearObject();
                    var strPatch = /qqmusic.qq.com/i;
                    if (url.search(strPatch)) {
                        if (parseInt(qusid) > 0) {
                            url = FM.getQusicH5URL(url);
                        }
                    }
                    FM.VH5Player.runPlayer(url, name, singerName, iSongId, iSongType, true);
                } else if (FM.VFlashPlayer) {
                    FM.VFlashPlayer.mPlayList.clearObject();
                    var strPatch = /qqmusic.qq.com/i;
                    if (url.search(strPatch)) {
                        if (parseInt(qusid) > 0) {
                            url = FM.getQusicH5URL(url);
                        }
                    }
                    FM.VFlashPlayer.runPlayer(url, name, singerName, iSongId, iSongType, true);
                } else {
                    FM.MediaPlayer.mPlayList.clearObject();
                    if (parseInt(qusid) > 0) {
                        url = FM.getQusicURL(url);
                    }
                    FM.MediaPlayer.runPlayer(url, name, singerName, iSongId, iSongType);
                    FM.loopCheckPlayer();
                }
            }
        } catch(e) {}
    }
    FM.BplaySong = function(name, url, qusid, singerName, iSongId, iSongType) {
        FM.pauseAppMusic();
        FM.initMusic(function() {
            FM.BplayOneSong(name, url, qusid, singerName, iSongId, iSongType);
        });
    }
    FM.BplaySong_local = function(name, url, qusid, singerName, iSongId, iSongType) {
        var iReportID = FM.getLocalReportID(url);
        FM.BplaySong(name, url, iReportID, singerName, iSongId, iSongType);
    }
    FM.getQuickTimePlugin = function() {
        var n = navigator;
        if (n.plugins && n.plugins.length) {
            for (var ii = 0; ii < n.plugins.length; ii++) {
                if (/quicktime/.test(n.plugins[ii].name.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }
    FM.mFromTag = (FM.isPengyou ? 28 : 22);
    FM.widget.popupDialog = function(title, html, width, height) {
        if (!top.window.loadPopupDialog) {
            includeJS("http://imgcache.qq.com/music/service_forother/app/js/popup_dialog.js",
            function() {
                try {
                    top.window.loadPopupDialog = true;
                    top.QZONE.FrontPage.popupDialog(title, html, width, height);
                } catch(e) {}
            },
            top.window.document);
        } else {
            top.QZONE.FrontPage.popupDialog(title, html, width, height);
        }
    }
    FM.widget.closePopup = function() {
        if (!top.window.loadPopupDialog) {
            includeJS("http://imgcache.qq.com/music/service_forother/app/js/popup_dialog.js",
            function() {
                try {
                    top.window.loadPopupDialog = true;
                    top.QZONE.FrontPage.closePopup();
                } catch(e) {}
            },
            top.window.document);
        } else {
            top.QZONE.FrontPage.closePopup();
        }
    }
    function updateDownloadPlayer() {
        openDownloadDiv();
    }
    FM.updateDownloadPlayer = updateDownloadPlayer;
    function openDownloadDiv() {
        var strHTML = '<iframe id="download_QQPlayer" frameborder="0" src="http://imgcache.qq.com/music/musicbox_v2_1/doc/downloadPlayer.html" allowTransparency="true" style="width:474px;height:311px;"></iframe>';
        FM.widget.popupDialog("下载最新版QQ音乐播放控件", strHTML, 476, 311);
        top.popupCallback = function() {}
    }
    FM.createProxy = function(src) {
        var f = document.getElementsByTagName("iframe");
        for (var i = 0; i < f.length; i++) {
            if (f[i].src.indexOf(src) != -1) {
                return;
            };
        }
        var i = document.createElement("iframe");
        i.id = "proxy_qmp";
        document.body.insertBefore(i, null);
        i.width = 0;
        i.height = 0;
        i.src = src;
        i = null;
    }
    FM.forceUseWmp = false;
    FM.addedPlayerDomain = false;
    FM.musicCb = null;
    FM.isNeedUpdatePlayer = false;
    FM.clearIframe = function() {
        try {
            setTimeout(function() {
                FM.dom.removeElement(FM.$("proxy_qmp"))
            },
            50);
        } catch(e) {}
    }
    FM.initMusic = function(cb) {
        FM.musicCb = null;
        function initQmp() {
            try {
                if (FM.isPengyou && !FM.addedPlayerDomain) {
                    FM.musicCb = cb;
                    FM.createProxy("http://music.qq.com/musicapp/pengyou/playctrl_adddomain_fm.html");
                    return true;
                }
                FM.BQQPlayer = null;
                FM.MediaPlayer = null;
                FM.VH5Player = null;
                FM.VFlashPlayer = null;
                FM.bUseBQQPlayer = true;
                FM.BQQPlayer = new FM.BlogQQPlayer();
                FM.BQQPlayer.createActiveX(true, false, false, "qqplayer", "0", "0", FM.PANEL_UIN_COOKIE_NAME, FM.PANEL_KEY_COOKIE_NAME, "http://www.qq.com");
                if (FM.BQQPlayer.initialize()) {
                    window.musicPlayerReady = true;
                    FM.tj2rp.playerType = 1;
                    return true;
                } else {
                    FM.bUseBQQPlayer = false;
                    FM.BQQPlayer = null;
                    FM.tj2rp.playerType = 0;
                    return false;
                }
                return true;
            } catch(e) {
                FM.bUseBQQPlayer = false;
                FM.BQQPlayer = null;
                return false;
            }
        }
        function initWmp() {
            try {
                FM.addedPlayerDomain = true;
                FM.bUseBQQPlayer = false;
                FM.BQQPlayer = null;
                FM.VH5Player = null;
                FM.VFlashPlayer = null;
                FM.MediaPlayer = new FM.WMPlayer();
                FM.MediaPlayer.createActiveX(true, false, "wmplayer", "0", "0", FM.PANEL_UIN_COOKIE_NAME, FM.PANEL_KEY_COOKIE_NAME, "http://www.qq.com");
                if (FM.MediaPlayer.initialize()) {
                    window.musicPlayerReady = true;
                    FM.tj2rp.playerType = 2;
                    return true;
                } else {
                    FM.tj2rp.playerType = 0;
                    return false;
                }
            } catch(e) {
                return false;
            }
        }
        function initH5Audio() {
            try {
                FM.addedPlayerDomain = true;
                FM.bUseBQQPlayer = false;
                FM.BQQPlayer = null;
                FM.MediaPlayer = null;
                FM.VFlashPlayer = null;
                if (!FM.VH5Player) FM.VH5Player = new FM.H5AudioPlayer();
                FM.VH5Player.createActiveX(true, false, "h5player", "0", "0", FM.PANEL_UIN_COOKIE_NAME, FM.PANEL_KEY_COOKIE_NAME, "http://www.qq.com");
                if (FM.VH5Player.initialize()) {
                    window.musicPlayerReady = true;
                    FM.tj2rp.playerType = 3;
                    return true;
                } else {
                    FM.tj2rp.playerType = 0;
                    return false;
                }
            } catch(e) {
                return false;
            }
        }
        function initFlash() {
            try {
                FM.addedPlayerDomain = true;
                FM.bUseBQQPlayer = false;
                FM.BQQPlayer = null;
                FM.MediaPlayer = null;
                FM.VH5Player = null;
                if (!FM.VFlashPlayer) FM.VFlashPlayer = new FM.FlashMusicPlayer();
                FM.VFlashPlayer.createActiveX(true, false, "flashmusicplayer", "0", "0", FM.PANEL_UIN_COOKIE_NAME, FM.PANEL_KEY_COOKIE_NAME, "http://www.qq.com");
                if (FM.VFlashPlayer.initialize()) {
                    window.musicPlayerReady = true;
                    FM.tj2rp.playerType = 4;
                    return true;
                } else {
                    FM.tj2rp.playerType = 0;
                    return false;
                }
            } catch(e) {
                return false;
            }
        }
        if (!FM.getPlayer() || !window.musicPlayerReady) {
            if ( !! ua.ie || ( !! ua && ua.tt >= 5 && !!ua.chrome)) {
                if (!initQmp()) {
                    if ( !! ua.ie) {
                        if (!initWmp()) {
                            if (!initFlash()) {
                                FM.console.print("init Flash error 1");
                                FM.isNeedUpdatePlayer = true;
                            }
                        }
                    } else {
                        if (!FM.userAgent.ttHtml5Audio) {
                            if (!initFlash()) {
                                FM.console.print("init Flash error 2");
                                FM.isNeedUpdatePlayer = true;
                            }
                        } else {
                            initH5Audio();
                        }
                    }
                }
            } else if ( !! ua.chrome || !!ua.safari) {
                if (/win/.test(navigator.platform.toLowerCase()) && !!ua.safari && !FM.getQuickTimePlugin()) {
                    FM.Tooltip.msg('对不起，您需要先安装QuickTime才能播放音乐');
                }
                if (!initH5Audio()) {
                    if (!initFlash()) {
                        FM.console.print("init Flash error 3");
                        FM.isNeedUpdatePlayer = true;
                    }
                }
            } else {
                if (!initQmp()) {
                    if (!initWmp()) {
                        if (!initFlash()) {
                            FM.console.print("init Flash error 4");
                            FM.isNeedUpdatePlayer = true;
                        }
                    }
                }
            }
            window.musicPlayerReady = true;
            if (FM.isPengyou && !FM.addedPlayerDomain) {
                return false;
            }
            setTimeout(function() {
                if (cb) {
                    cb();
                };
            },
            1000);
        } else {
            if (cb) {
                cb();
            };
        }
    }
    FM.MyOpenwin = function(ul) {
        win = window.open(ul);
        if (!ua.tt >= 5) {
            if (win == null) {
                alert("弹出窗口被拦截,请取消拦截");
                return null;
            } else {
                win.focus();
            }
            return win;
        }
    }
    FM.idCheckPlayerTimer = null;
    FM.clearCheckPlayer = function() {
        if (FM.idCheckPlayerTimer) {
            window.clearTimeout(FM.idCheckPlayerTimer);
            FM.idCheckPlayerTimer = null;
        }
    }
    FM.loopCheckPlayer = function() {
        FM.clearCheckPlayer();
        FM.idCheckPlayerTimer = setTimeout(FM.checkPlayer, 500);
    }
    FM.isFirstPlaying = true;
    FM.checkPlayer = function() {
        try {
            var mPlayerName = FM.MediaPlayer.mPlayerName;
            var iStatus = mPlayerName.playState;
            switch (iStatus) {
            case 1:
                FM.clearCheckPlayer();
                g_playerCallback.OnStateChanged(g_playerStatus.S_STOP);
                FM.isFirstPlaying = true;
                break;
            case 2:
                FM.clearCheckPlayer();
                g_playerCallback.OnStateChanged(g_playerStatus.S_PAUSE);
                FM.isFirstPlaying = true;
                break;
            case 3:
                FM.loopCheckPlayer();
                if (FM.isFirstPlaying) {
                    g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYING);
                    FM.isFirstPlaying = false;
                }
                g_playerCallback.OnPlayProgress(mPlayerName.controls.currentPosition, mPlayerName.currentMedia.duration);
                if (mPlayerName.currentMedia.duration - mPlayerName.controls.currentPosition < 0.6) {
                    FM.clearCheckPlayer();
                    FM.isFirstPlaying = true;
                    FM.MediaPlayer.stopPlayer();
                    g_playerCallback.OnStateChanged(g_playerStatus.S_PLAYEND);
                }
                break;
            case 6:
            case 4:
            case 5:
            case 7:
            case 8:
            case 9:
                g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
                FM.loopCheckPlayer();
                break;
            case 10:
                g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
                FM.loopCheckPlayer();
                if (mPlayerName.URL.indexOf('fcg_set_musiccookie') > -1) {
                    FM.MediaPlayer.mSetedCookie = true;
                } else {
                    FM.BQplay();
                }
                break;
            case 11:
                g_playerCallback.OnStateChanged(g_playerStatus.S_BUFFERING);
                FM.loopCheckPlayer();
                break;
            default:
                FM.loopCheckPlayer();
                break;
            }
        } catch(e) {}
        return;
    }
    FM.showMsgbox = function(msg, type, timeout, pixTop) {
        try {
            FM.Tooltip.msg(msg, timeout);
        } catch(e) {
            alert(msg);
        }
    };
    FM.showLoginBox = function(name, cb) {
        try {
            if (typeof(window.PENGYOU) != "undefined" && PENGYOU.FP && PENGYOU.FP.showLoginBox) {
                PENGYOU.FP.showLoginBox(name, cb);
            } else {
                top.window.location.href = 'http://www.pengyou.com/';
            }
        } catch(e) {
            top.window.location.href = 'http://www.pengyou.com/';
        }
    }
    FM.showBusyInfo = function() {
        FM.showMsgbox("服务器繁忙，请稍候重试！", 1, 2000);
    }
    window.source = window.source || 255;
    FM.setPlayProgressTime = function(pos) {
        try {
            FM.console.print("FM.setPlayProgressTime 1,pos:", pos);
            pos = parseInt(pos, 10);
            FM.console.print("FM.setPlayProgressTime 2,pos:", pos);
            if ( !! FM.BQQPlayer) {
                FM.BQQPlayer.mPlayerName.CurPos = pos;
            } else if ( !! FM.MediaPlayer) {
                if (FM.MediaPlayer.mPlayerName.currentMedia) {
                    FM.BQpause();
                    FM.MediaPlayer.mPlayerName.controls.currentPosition = pos;
                    FM.BQplay();
                }
            } else if ( !! FM.VH5Player) {
                FM.VH5Player.mPlayerName.currentTime = pos;
            } else if ( !! FM.VFlashPlayer) {
                FM.console.print("FM.VFlashPlayer.setPlayProgressTime 1");
                var oplay = FM.VFlashPlayer.mPlayerName;
                oplay.swfSeekMusic(pos);
            }
        } catch(e) {
            FM.console.print("FM.setPlayProgressTime exp:", e.message);
        }
    }
    FM.statImgSend = function(url, t) {
        if (!window.tmpMusicStat) {
            window.tmpMusicStat = [];
        }
        var l = window.tmpMusicStat.length;
        window.tmpMusicStat[l] = new Image();
        with(window.tmpMusicStat[l]) {
            onload = onerror = new Function('this.ready=true;this.onload=this.onerror=null;FM.statImgClean();');
        }
        window.setTimeout("window.tmpMusicStat[" + l + "].src = '" + url + "';", t);
    }
    FM.statImgClean = function() {
        for (var i = 0,
        l = window.tmpMusicStat.length; i < l; i++) {
            if ( !! window.tmpMusicStat[i] && !!window.tmpMusicStat[i].ready) {
                delete window.tmpMusicStat[i];
            }
        }
    }
    FM.getPlayProgress = function() {
        var obj = FM.getPlayer();
        if (!obj) {
            return {
                lCurPos: 0
            };
        }
        return {
            lCurPos: obj.mCurPlayPos
        };
    }
    FM.tj2rp = {
        _img: null,
        playerType: 0,
        arrayStatSong: [],
        _s: "",
        getRUin: function() {
            if (this._s.length > 0) {
                return this._s;
            }
            var u = FM.getCookie("pgv_pvid");
            if ( !! u && u.length > 0) {
                this._s = u;
                return this._s;
            }
            var curMs = (new Date()).getUTCMilliseconds();
            this._s = (Math.round(Math.random() * 2147483647) * curMs) % 10000000000;
            document.cookie = "pgv_pvid=" + this._s + "; Expires=Sun, 18 Jan 2038 00:00:00 GMT; PATH=/; DOMAIN=" + FM.getDomain() + ";";
            return this._s;
        },
        statSong: function(songObj) {
            try {
                var m = FM.tj2rp;
                var a = m.arrayStatSong;
                function sendStat(noTimeout) {
                    noTimeout = noTimeout || false;
                    var o = null,
                    id = [],
                    type = [],
                    playtime = [],
                    starttime = [],
                    fromtag2 = [];
                    var count = a.length;
                    for (var i = 0; i < count; i++) {
                        o = a[i];
                        id.push((parseInt(o.id) < 1 ? 0 : o.id));
                        type.push(o.type || 0);
                        playtime.push(o.playtime);
                        starttime.push(o.starttime);
                        fromtag2.push(o.fromtag2);
                    }
                    if (count > 0) {
                        var statUrl = 'http://pt.music.qq.com/fcgi-bin/cgi_music_webreport.fcg?Count=' + count + '&Fqq=' + FM.getLoginUin() + '&Fguid=' + m.getRUin() + '&Ffromtag1=6&Ffromtag2=' + fromtag2.join(",") + '&Fsong_id=' + id.join(",") + '&Fplay_time=' + playtime.join(",") + '&Fstart_time=' + starttime.join(",") + '&Ftype=' + type.join(",") + '&Fversion=' + m.playerType;
                        if (noTimeout) {
                            m._img = new Image();
                            m._img.src = statUrl;
                        } else {
                            FM.statImgSend(statUrl, 0);
                        }
                    }
                    id = null;
                    type = null;
                    playtime = null;
                    starttime = null;
                    fromtag2 = null;
                    m.arrayStatSong = [];
                }
                var len = a.length;
                if (len > 0) {
                    a[len - 1].playtime = Math.ceil(FM.getPlayProgress().lCurPos);
                    var obj = FM.getPlayer();
                    if (obj) {
                        obj.mCurPlayPos = 0;
                    }
                }
                if (typeof(songObj) == "object" && songObj != null) {
                    if (len == 5) {
                        sendStat();
                    }
                    songObj.starttime = parseInt((new Date()).getTime() / 1000, 10);
                    a.push(songObj);
                } else {
                    sendStat(true);
                }
            } catch(e) {};
        },
        isNetUrl: function(url) {
            if (url.indexOf("music.qq.com") < 0) {
                return true;
            };
            return false;
        },
        isLocalUrl: function(url) {
            if (url.indexOf("streamrdt.music.qq.com") > -1) {
                return true;
            };
            return false;
        },
        isQusicUrl: function(url) {
            if (url.indexOf("qqmusic.qq.com") > -1) {
                return true;
            };
            return false;
        },
        getSongType: function(url) {
            return FM.tj2rp.isQusicUrl(url) ? 3 : (FM.tj2rp.isLocalUrl(url) ? 5 : 1);
        }
    };
    FM.channel = FM.channel || {};
    FM.object.extend(String.prototype, {
        trim: function() {
            return this.replace(/(^\s*)|(\s*$)/g, "");
        },
        escapeHTML: function() {
            var div = document.createElement('div');
            var text = document.createTextNode(this);
            div.appendChild(text);
            return div.innerHTML;
        },
        unescapeHTML: function() {
            var div = document.createElement('div');
            div.innerHTML = this;
            return div.innerText || div.textNode || '';
        },
        cut: function(bitLen, tails) {
            str = this;
            bitLen -= 0;
            tails = tails || '...';
            if (isNaN(bitLen)) {
                return str;
            }
            var len = str.length,
            i = Math.min(Math.floor(bitLen / 2), len),
            cnt = FM.string.getRealLen(str.slice(0, i));
            for (; i < len && cnt < bitLen; i++) {
                cnt += 1 + (str.charCodeAt(i) > 255);
            }
            return str.slice(0, cnt > bitLen ? i - 1 : i) + (i < len ? tails: '');
        },
        jstpl_format: function(ns) {
            function fn(w, g) {
                if (g in ns) return ns[g];
                return '';
            };
            return this.replace(/%\(([A-Za-z0-9_|.]+)\)/g, fn);
        }
    });
    FM.event.getWheelDelta = function(event) {
        if (event.wheelDelta) {
            return event.wheelDelta;
        } else {
            return - event.detail * 40;
        }
    };
    FM.scrollbar = (function() {
        var E = FM.event;
        var D = FM.dom;
        var bar, barp, cont, contp, barsz, barpsz, contsz, contpsz, rate, i = 0,
        bmax, isScroll = false,
        intf, delta, bnewy, cnewy, barclassname, _options = {
            bartop: "",
            barleft: 0,
            bar_hover: "",
            wheel_len: 8,
            wheel_num: 10,
            interval: 15
        };
        function init(options) {
            try {
                bar = D.get(options.barid);
                cont = D.get(options.contid);
                barp = bar.parentNode;
                barp.style.display = "";
                contp = cont.parentNode;
                contsz = D.getSize(cont);
                barpsz = D.getSize(barp);
                contpsz = D.getSize(contp);
                barclassname = bar.className;
                ullen = D.getSize(D.get(options.ulid))[1];
                var addheight = 0;
                if (options.ulid == "fm_fav_list") {
                    addheight = 0;
                } else {
                    addheight = 90;
                }
                var rate1 = (ullen + addheight) / barpsz[1];
                var newheight = parseInt(barpsz[1] / rate1);
                _options.barleft = D.getStyle(bar, "left");
                if (_options.bartop === "") {
                    _options.bartop = parseInt(D.getStyle(bar, "top"));
                } else {
                    D.setXY(cont, 0, 0);
                    D.setXY(bar, _options.barleft, _options.top);
                }
                _options.bar_hover = barclassname;
                FM.object.extend(_options, options || {});
                if (newheight < 20) {
                    newheight = 20;
                }
                if (newheight > barpsz[1] - _options.bartop * 2) {
                    bar.style.display = "none";
                    barp.style.display = "none";
                    E.removeEvent(bar, "mousedown", setBar);
                    E.removeEvent(barp, "click", setBarp, arr); (function() {
                        E.removeEvent(contp, "mousewheel", setWheel);
                        E.removeEvent(contp, "DOMMouseScroll", setWheel);
                        E.removeEvent(barp, "mousewheel", setWheel);
                        E.removeEvent(barp, "DOMMouseScroll", setWheel);
                    })();
                    if (isScroll) {
                        clearInterval(intf);
                        isScroll = false;
                    }
                    return;
                }
                bar.style.height = newheight + "px";
                bar.style.display = "none";
                bar.style.display = "";
                barsz = D.getSize(bar);
                if (isScroll) {
                    clearInterval(intf);
                    isScroll = false;
                }
                rate = (ullen - contpsz[1]) / (barpsz[1] - barsz[1] - _options.bartop);
                bmax = barpsz[1] - barsz[1] - 2 * _options.bartop - 1;
                cmax = contsz[1] - contpsz[1];
                E.addEvent(bar, "mousedown", setBar);
                var body = document.body;
                E.addEvent(body, "mouseup",
                function() {
                    E.removeEvent(body, "mousemove", showchange);
                    bar.className = barclassname;
                });
                var arr = {
                    "top": parseInt(D.getStyle(bar, "top")),
                    "ey": D.getXY(bar)[1] + barsz[1] / 2
                };
                E.addEvent(barp, "click", setBarp, arr); (function() {
                    E.addEvent(contp, "mousewheel", setWheel);
                    E.addEvent(contp, "DOMMouseScroll", setWheel);
                    E.addEvent(barp, "mousewheel", setWheel);
                    E.addEvent(barp, "DOMMouseScroll", setWheel);
                })();
            } catch(e) {
                FM.console.print("scrollbar init exp:" + e.message);
            }
        }
        function setBarp(e, arr) {
            var target = E.getTarget(e);
            if (target == this) {
                showchange(e, arr);
            }
        }
        function showchange(e, arr) {
            var event = E.getEvent(e);
            E.preventDefault(event);
            var y = E.mouseY(event);
            var moveY = y - arr.ey;
            var newy = moveY + arr.top;
            var cnewy = -newy * rate;
            if (newy <= _options.bartop) {
                newy = _options.bartop;
                cnewy = 0;
            } else if (newy > bmax) {
                newy = bmax;
                cnewy = -cmax;
            }
            if (cnewy + cmax < 0) {
                cnewy = -cmax;
            }
            D.setXY(cont, 0, cnewy);
            D.setXY(bar, _options.barleft, newy);
        }
        function setBar(e) {
            var event = E.getEvent(e);
            E.preventDefault(event);
            var barxy = D.getXY(bar);
            var ey = E.mouseY(event);
            var top = barxy[1] - D.getXY(barp)[1];
            var arr = {
                "top": top,
                "ey": ey
            };
            E.addEvent(document.body, "mousemove", showchange, arr);
        }
        function changewheel() {
            if (delta + 1) {
                i++;
            } else {
                i--;
            }
            if (i == 0) {
                clearInterval(intf);
                isScroll = false;
            }
            bnewy += -delta * _options.wheel_len / rate;
            cnewy += delta * _options.wheel_len;
            if (bnewy < _options.bartop) {
                bnewy = _options.bartop;
                i == 0;
            } else if (bnewy > bmax) {
                bnewy = bmax;
                i == 0;
            }
            if (cnewy > 0) {
                cnewy = 0;
            } else if (cmax + cnewy < 0) {
                cnewy = -cmax;
            }
            D.setXY(cont, 0, cnewy);
            D.setXY(bar, _options.barleft, bnewy);
        }
        function setWheel(e) {
            var event = E.getEvent(e);
            E.preventDefault(event);
            delta = E.getWheelDelta(event) / 120;
            if (!isScroll) {
                isScroll = true;
                bnewy = D.getXY(bar)[1] - D.getXY(barp)[1];
                cnewy = D.getXY(cont)[1] - D.getXY(contp)[1];
                if (delta + 1) {
                    i = -_options.wheel_num;
                } else {
                    i = _options.wheel_num;
                }
                intf = setInterval(changewheel, _options.interval);
            } else {
                if (delta + 1) {
                    if (i < 0) {
                        i = i - _options.wheel_num;
                    } else {
                        i = -_options.wheel_num;
                    }
                } else {
                    if (i < 0) {
                        i = _options.wheel_num;
                    } else {
                        i = i + _options.wheel_num;
                    }
                }
            }
        }
        function selectElement(element) {
            try {
                if (bar.style.display == "none") {
                    return;
                } else {
                    var element = D.get(element);
                    var position = D.getXY(element);
                    var contParentXY = D.getXY(contp);
                    var cnewy = position[1] - contParentXY[1];
                    var bnewy = cnewy / rate;
                    if (bnewy <= _options.bartop + 10) {
                        bnewy = _options.bartop;
                        cnewy = 0;
                    } else if (bnewy > bmax) {
                        bnewy = bmax;
                        cnewy = cmax;
                    }
                    if (cnewy > cmax) {
                        cnewy = cmax;
                    } else if (cnewy < 0) {
                        cnewy = 0;
                    }
                    D.setXY(cont, 0, -cnewy);
                    D.setXY(bar, _options.barleft, bnewy);
                }
            } catch(e) {
                FM.console.print("selectElement exp:" + e.message);
            }
        }
        return {
            init: init,
            selectElement: selectElement
        };
    })();
    FM.pic = (function() {
        function doImgErr(event) {
            var event = event || window.event;
            var obj = event.target || event.srcElement;
            obj.src = "http://imgcache.qq.com/mediastyle/y/img/cover_mine_130.jpg";
            obj.onerror = null;
        }
        function change(src) {
            try {
                var img_cover = document.getElementById('img_cover');
                img_cover.src = src;
            } catch(e) {}
        }
        return {
            doImgErr: doImgErr,
            change: change
        };
    })();
    FM.module.share = (function() {
        var qzoneShareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=%(url)&desc=%(desc)&summary=%(summary)&title=%(title)&pics=%(pics)',
        pengyouShareUrl = 'http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?to=pengyou&url=%(url)&desc=%(desc)&summary=%(summary)&title=%(title)&pics=%(pics)',
        weiboShareUrl = 'http://v.t.qq.com/share/share.php?url=%(url)&title=%(title)&pic=%(pic)',
        sinaShareUrl = 'http://service.weibo.com/share/share.php?url=%(url)&title=%(title)',
        kaixinShareUrl = 'http://www.kaixin001.com/repaste/share.php?rurl=%(url)&rcontent=%(desc)&rtitle=%(title)',
        renrenShareUrl = 'http://share.renren.com/share/buttonshare.do?link=%(url)&title=%(title)',
        doubanShareUrl = 'http://www.douban.com/recommend/?url=%(url)&title=%(title)',
        sohuShareUrl = 'http://t.sohu.com/third/post.jsp?content=utf-8&url=%(url)&title=%(title)',
        netEasyShareUrl = 'http://t.163.com/article/user/checkLogin.do?link=%(url)&info=%(info)&source=%(source)';
        _options = {
            url: window.location.href,
            desc: '',
            summary: '',
            title: '',
            pics: '',
            pic: ''
        };
        function reset() {
            _options = {
                url: window.location.href,
                desc: '',
                summary: '',
                title: '',
                pics: '',
                pic: ''
            };
        }
        function setParam(options) {
            FM.object.extend(_options, options || {});
            for (var i in _options) {
                _options[i] = encodeURIComponent(_options[i]);
            }
        }
        function shareToQzone(options) {
            setParam(options);
            var url = qzoneShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareToPengyou(options) {
            setParam(options);
            var url = pengyouShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareToWeibo(options) {
            setParam(options);
            var url = weiboShareUrl.jstpl_format(_options);
            if ( !! options.preopenwin) {
                OpenGetWindow(url, "_shareFm", {});
            } else {
                window.open(url);
            }
            reset();
        }
        function shareToSina(options) {
            setParam(options);
            var url = sinaShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareToKaixin(options) {
            setParam(options);
            var url = kaixinShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareToRenren(options) {
            setParam(options);
            var url = renrenShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareToDouban(options) {
            setParam(options);
            var url = doubanShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareToSohu(options) {
            setParam(options);
            var url = sohuShareUrl.jstpl_format(_options);
            window.open(url);
            reset();
        }
        function shareTo163(options) {
            setParam(options);
            var url = netEasyShareUrl.jstpl_format({
                url: _options.url,
                info: _options.desc + _options.url,
                source: encodeURIComponent('QQ????')
            });
            window.open(url);
            reset();
        }
        function openEmptyWindow(sWindowName) {
            if (typeof sWindowName !== "string") {
                sWindowName = "_webQQMusicPlayer";
            }
            try {
                if (!ua.ie) {
                    if (top.window.win) {
                        top.window.win.close();
                        top.window.win = null;
                    }
                }
            } catch(e) {}
            try {
                if (!top.window.win || top.window.win.closed == true) {
                    top.window.win = window.open("", sWindowName);
                    if (!top.window.win && !(ua.tt >= 5)) {
                        FM.Tooltip.msg("弹出窗口被拦截,请取消拦截!");
                    }
                }
            } catch(e) {}
        };
        function OpenGetWindow(sUrl, sWindowName) {
            if (typeof sWindowName !== "string") {
                sWindowName = "";
            }
            window.open(sUrl, sWindowName);
        };
        return {
            openEmptyWindow: openEmptyWindow,
            OpenGetWindow: OpenGetWindow,
            shareToQzone: shareToQzone,
            shareToWeibo: shareToWeibo,
            shareToPengyou: shareToPengyou,
            shareToSina: shareToSina,
            shareToKaixin: shareToKaixin,
            shareToRenren: shareToRenren,
            shareToSohu: shareToSohu,
            shareTo163: shareTo163,
            shareToDouban: shareToDouban
        };
    })();
    window.g_share = FM.module.share;
    FM.channel.fm = {
        isPengyou: FM.isPengyou,
        _song_num: 10,
        _sim_song_num: 5,
        _type_num: 3,
        _callback_counter: 0,
        _callback_timer: null,
        _curFmInfo: {
            fmType: 0,
            fmId: 0,
            fmName: ""
        },
        _fmInfoObj: {},
        _fmNameObj: {},
        _fmListInfo: {},
        _curSongInfo: null,
        _isPlayNow: true,
        _isLoading: false,
        _divSongCover: null,
        _divSongName: null,
        _divSongTime: null,
        _divSongBarLine: null,
        _divSongBarPoint: null,
        _btnPlay: null,
        _btnLike: null,
        _curChn: null,
        _chnContainer: {},
        _curChnType: null,
        _curChnList: null,
        _myFavFm: null,
        _myFavSong: null,
        _isFirstInit: true,
        _isResumeMusic: false,
        _isFirstShow: true,
        _statArrNum: 7,
        _statArr: ['', '', '', '', '', '', ''],
        init: function(options) {
            if ( !! options && !!options.fmInfoObj) {
                FM.object.extend(this._fmInfoObj, options.fmInfoObj || {});
            }
            var D = FM.dom;
            this._divSongCover = D.get("divsongcover");
            this._divSongName = D.get("divsongname");
            this._divSongTime = D.get("divsongtime");
            this._divSongBarLine = D.get("divsongbarline");
            this._divSongBarPoint = D.get("divsongbarpoint");
            this._btnPlay = D.get("btnplay");
            this._btnLike = D.get("btnlike");
            this._myFavFm = D.get("divmyfavfm");
            this._myFavSong = D.get("divmyfavsong");
            this._curChnType = D.get("ch_1");
            this._curChnList = D.get("content_1");
            this.renderFmList("0_1");
            this.selectFmEvent();
            g_webPlayer.init({
                fromtag: 28,
                statFromtag: 5
            });
            g_fmChn.listenrecord.report();
        },
        renderFmList: function(id_type) {
            var list_tpl1 = '<li><a _href="#%(id)_%(type)" href="javascript:;" onclick="g_fmChn.setChnAndList(%(id),%(type),false,true);return false;" hidefocus="hidefocus" title="%(name)">%(name)&nbsp;MHZ</a><div class="fm_op"><a href="javascript:;" id="btn_fm_fav_%(id)_%(type)" class="btn_fm_fav" onclick="g_fmChn.addOrDelFavFm(%(id),%(type),this);" title="收藏">收藏</a><a href="javascript:;" class="btn_fm_share" onclick="g_fmChn.shareFm(%(id),%(type),\'%(name)\');return false;" title="分享">分享</a></div></li>';
            var list_tpl2 = '<li><a _href="#%(id)_%(type)" href="javascript:;" onclick="g_fmChn.setChnAndList(%(id),%(type),false,true);return false;" hidefocus="hidefocus" title="%(name)">%(name)</a><div class="fm_op"><a href="javascript:;" id="btn_fm_fav_%(id)_%(type)" class="btn_fm_fav" onclick="g_fmChn.addOrDelFavFm(%(id),%(type),this);" title="收藏">收藏</a><a href="javascript:;" class="btn_fm_share" onclick="g_fmChn.shareFm(%(id),%(type),\'%(name)\');return false;" title="分享">分享</a></div></li>';
            var type = 1,
            id = 0;
            var fmInfo = {};
            if (id_type) {
                id_type = id_type.split('_');
                id = id_type[0];
                type = id_type[1];
            }
            var inited = true;
            var fm = {};
            for (var j = 1; j <= this._type_num; j++) {
                var list = this._fmInfoObj["type" + j];
                for (var i = 0,
                len = list.length; i < len; i++) {
                    list[i].type = j;
                    list[i].name = list[i].name.myEncode();
                    this._fmNameObj[list[i].id + "_" + j] = list[i].name;
                    this._fmListInfo[list[i].id + "_" + j] = list[i].i;
                    if (!fm[list[i].i]) {
                        fm[list[i].i] = [];
                    }
                    if (j != 2) {
                        fm[list[i].i].push(list_tpl1.jstpl_format(list[i]));
                    } else {
                        fm[list[i].i].push(list_tpl2.jstpl_format(list[i]));
                    }
                    if (inited) {
                        fmInfo.fmType = 1;
                        fmInfo.fmId = list[i].id;
                        fmInfo.fmName = list[i].name;
                        inited = false;
                    }
                }
            }
            for (var name in fm) {
                FM.dom.get("content_" + name).innerHTML += fm[name].join('');
            }
            for (var i = 1; i <= this._type_num; i++) {
                if (!FM.dom.get("content_" + i)) {
                    continue;
                }
                var node = FM.dom.getFirstChild("content_" + i);
                if (!node) {
                    continue;
                }
                fnode = FM.dom.getFirstChild(node);
                if (!fnode) {
                    continue;
                }
                var _href = fnode.getAttribute("_href");
                _href = _href.substring(_href.indexOf('#'));
                this._chnContainer[_href] = fnode;
                while (node = FM.dom.getNextSibling(node)) {
                    var fnode = FM.dom.getFirstChild(node);
                    _href = fnode.getAttribute("_href");
                    _href = _href.substring(_href.indexOf('#'));
                    this._chnContainer[_href] = fnode;
                }
            }
            this._chnContainer["#0_100"] = FM.dom.get("ch_0_100");
            this._fmNameObj["0_100"] = "猜你喜欢";
            var resumeMusic = false;
            if (FM.isFirstLoad) {
                if (FM.resumeMusic()) {
                    resumeMusic = true;
                    g_fmChn._isResumeMusic = true;
                    g_fmChn._isPlayNow = false;
                    id = FM.fmInfo.fmId;
                    type = FM.fmInfo.fmType;
                    g_webPlayer.startPlayer();
                } else {
                    g_fmChn._isResumeMusic = false;
                    g_fmChn._isPlayNow = true;
                }
            } else {
                g_fmChn._isPlayNow = true;
            }
            var tag = '#' + id + '_' + type;
            if ( !! this._chnContainer[tag]) {
                fmInfo.fmType = type;
                fmInfo.fmId = id;
                fmInfo.fmName = this._fmNameObj[id + "_" + type];
            }
            this._curChn = this._chnContainer['#' + fmInfo.fmId + '_' + fmInfo.fmType];
            this._curChn.parentNode.className = "current";
            this.setChnAndList(fmInfo.fmId, fmInfo.fmType, resumeMusic, false, true);
            FM.scrollbar.init({
                barid: "bar",
                contid: "content",
                bar_hover: "slider slider_hover",
                ulid: this._curChnList
            });
        },
        myFavFm: {
            idList: [],
            currentPage: 1,
            itemNum: 100,
            maxPage: 1,
            isLoad: false,
            init: function(json) {
                this.idList = json.radio_list.reverse();
                for (var i = 0,
                l = this.idList.length; i < l; i++) {
                    if (!g_fmChn._fmNameObj[this.idList[i].radioid + '_' + this.idList[i].type]) {
                        this.idList.splice(i, 1);
                        i--;
                    }
                }
                this.maxPage = Math.ceil(this.idList.length / this.itemNum);
                if (this.maxPage == 0) {
                    this.maxPage = 1;
                }
                this.updateAllListFavBtn();
                g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
            },
            updateAllListFavBtn: function() {
                try {
                    var btn;
                    for (var i = 0,
                    l = this.idList.length; i < l; i++) {
                        btn = FM.dom.get("btn_fm_fav_" + this.idList[i].radioid + "_" + this.idList[i].type);
                        if ( !! btn) {
                            btn.className = "btn_fm_fav_current";
                            btn.title = "取消收藏";
                            FM.css.addClassName(btn.parentNode.parentNode, "fm_sort_fav");
                        }
                    }
                } catch(e) {}
            },
            getList: function() {
                var _this = this;
                g_fmChn.favFm.getList(function(json) {
                    _this.isLoad = true;
                    _this.init(json);
                    g_fmChn._callback_counter++;
                });
            },
            showPage: function(pageNum) {
                if (pageNum > this.maxPage || pageNum < 1) {} else {
                    var list_tpl1 = '<li id="favfm_%(id)_%(type)" i="%(i)" class="fm_sort_fav"><a _href="#%(id)_%(type)" href="javascript:;" onclick="g_fmChn.playFavFm(%(id),%(type),this);return false;" hidefocus="hidefocus" title="%(name)">%(name)&nbsp;MHZ</a><div class="fm_op"><a href="javascript:;" class="btn_fm_fav_current" onclick="g_fmChn.myFavFm.deleteItem(%(i));" title="取消收藏">收藏</a><a href="javascript:;" class="btn_fm_share" onclick="g_fmChn.shareFm(%(id),%(type),\'%(name)\');return false;" title="分享">分享</a></div></li>';
                    var list_tpl2 = '<li id="favfm_%(id)_%(type)" i="%(i)" class="fm_sort_fav"><a _href="#%(id)_%(type)" href="javascript:;" onclick="g_fmChn.playFavFm(%(id),%(type),this);return false;" hidefocus="hidefocus" title="%(name)">%(name)</a><div class="fm_op"><a href="javascript:;" class="btn_fm_fav_current" onclick="g_fmChn.myFavFm.deleteItem(%(i));" title="取消收藏">收藏</a><a href="javascript:;" class="btn_fm_share" onclick="g_fmChn.shareFm(%(id),%(type),\'%(name)\');return false;" title="分享">分享</a></div></li>';
                    this.currentPage = pageNum;
                    var i = (pageNum - 1) * this.itemNum,
                    len = pageNum * this.itemNum,
                    maxIndex = this.idList.length,
                    listHTML = [],
                    itemHTML = "",
                    item,
                    radioNameList = g_fmChn._fmNameObj;
                    for (; i < len; i++) {
                        if (i < maxIndex) {
                            item = this.idList[i];
                            itemHTML = (item.type != 2 ? list_tpl1: list_tpl2).jstpl_format({
                                id: item.radioid,
                                type: item.type,
                                name: (radioNameList[item.radioid + '_' + item.type]).myEncode(),
                                i: i
                            });
                            listHTML.push(itemHTML);
                        } else {
                            break;
                        }
                    }
                    if (this.idList.length == 0) {
                        listHTML.push('<li><div class="radioisnull"><p class="no_record">你还没有收藏任何电台。</p></div></li>');
                    }
                    var doc = document;
                    doc.getElementById("fm_fav_list").innerHTML = listHTML.join("");
                    FM.scrollbar.init({
                        barid: "myfavfm_bar",
                        contid: "fm_fav_list",
                        bar_hover: "slider slider_hover",
                        ulid: "fm_fav_list"
                    });
                    var jsList = ['lib/jquery', 'lib/pengyou'];
                    seajs.use(jsList,
                    function($, PY) {
                        try {
                            var fmId = g_fmChn._curFmInfo.fmId,
                            fmType = g_fmChn._curFmInfo.fmType;
                            $("#favfm_" + fmId + "_" + fmType).addClass("current");
                        } catch(e) {}
                        $(".fm_list li").hover(function() {
                            $(this).addClass("hover");
                        },
                        function() {
                            $(this).removeClass("hover");
                        });
                    });
                }
            },
            addToMyFavFmList: function(info) {
                var info = info,
                _this = this;
                g_fmChn.favFm.add({
                    'fmId': info.radioid,
                    'fmType': info.type
                },
                function() {
                    _this.idList.unshift(info);
                    _this.maxPage = Math.ceil(_this.idList.length / _this.itemNum);
                    if (_this.maxPage == 0) {
                        _this.maxPage = 1;
                    }
                    try {
                        if ( !! info.obj) {
                            info.obj.className = "btn_fm_fav_current";
                            info.obj.title = "取消收藏";
                            FM.css.addClassName(info.obj.parentNode.parentNode, "fm_sort_fav");
                        }
                    } catch(e) {}
                });
            },
            deleteFromMyFavFmList: function(info) {
                var index = -1;
                for (var i = 0,
                len = this.idList.length; i < len; i++) {
                    if (this.idList[i].radioid == info.radioid) {
                        index = i;
                        break;
                    }
                }
                if (index >= 0) {
                    var info = info,
                    _this = this;
                    g_fmChn.favFm.del({
                        'fmId': info.radioid,
                        'fmType': info.type
                    },
                    function() {
                        var deletFM = _this.idList.splice(index, 1);
                        _this.maxPage = Math.ceil(_this.idList.length / _this.itemNum);
                        if (_this.maxPage == 0) {
                            _this.maxPage = 1;
                        }
                        try {
                            if ( !! info.obj) {
                                info.obj.className = "btn_fm_fav";
                                info.obj.title = "收藏";
                                FM.css.removeClassName(info.obj.parentNode.parentNode, "fm_sort_fav");
                            }
                        } catch(e) {}
                    });
                }
            },
            deleting: 0,
            deleteItem: function(index) {
                if (g_fmChn.favFm.deleting) {
                    return;
                }
                g_fmChn.favFm.deleting = 1;
                var index = index,
                deletFM = this.idList[index],
                _this = this;
                g_fmChn.favFm.del({
                    'fmId': deletFM.radioid,
                    'fmType': deletFM.type
                },
                function() {
                    var deletFM = _this.idList.splice(index, 1);
                    _this.maxPage = Math.ceil(_this.idList.length / _this.itemNum);
                    if (_this.maxPage == 0) {
                        _this.maxPage = 1;
                    }
                    if (_this.currentPage <= _this.maxPage) {
                        _this.showPage(_this.currentPage);
                    } else {
                        _this.prevPage();
                    }
                    g_fmChn.favFm.deleting = 0;
                    try {
                        var btn = FM.dom.get("btn_fm_fav_" + deletFM[0].radioid + "_" + deletFM[0].type);
                        if ( !! btn) {
                            btn.className = "btn_fm_fav";
                            btn.title = "收藏";
                            FM.css.removeClassName(btn.parentNode.parentNode, "fm_sort_fav");
                        }
                    } catch(e) {
                        FM.console.print("deleteItem exp:", e.message);
                    }
                });
            },
            show: function() {
                if (!this.isLoad) {
                    var _this = this;
                    g_fmChn.favFm.getList(function(data) {
                        _this.isLoad = true;
                        _this.init(data);
                        _this.showPage(1);
                    });
                } else {
                    this.showPage(1);
                }
            }
        },
        myFavSong: {
            songList: [],
            songListMap: [],
            currentPage: 1,
            itemNum: 10,
            maxPage: 1,
            isLoad: false,
            init: function(json) {
                this.songList = json.SongList;
                for (var i = 0,
                len = this.songList.length; i < len; i++) {
                    this.songListMap[this.songList[i].id] = true;
                }
                this.maxPage = Math.ceil(this.songList.length / this.itemNum);
                if (this.maxPage == 0) {
                    this.maxPage = 1;
                }
                g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
            },
            getList: function() {
                var _this = this;
                g_fmChn.favSong.getList(function(json) {
                    _this.init(json);
                    g_fmChn._callback_counter++;
                });
            },
            isInSongList: function(songId) {
                return !! this.songListMap[songId];
            },
            addToMyFavSongList: function(songInfo) {
                var _this = this,
                songInfo = songInfo;
                g_fmChn.favSong.add(songInfo.id, songInfo.type,
                function() {
                    _this.songList.unshift(songInfo);
                    _this.songListMap[songInfo.id] = true;
                    _this.maxPage = Math.ceil(_this.songList.length / _this.itemNum);
                    if (_this.maxPage == 0) {
                        _this.maxPage = 1;
                    }
                });
            },
            delFromFavSongList: function(songId, songType) {
                var id = songId,
                type = songType || 3,
                _this = this;
                g_fmChn.favSong.del(songId, songType,
                function() {
                    _this.songListMap[id] = false;
                    for (var i = 0; i < _this.songList.length; i++) {
                        if (_this.songList[i].id == id) {
                            _this.songList.splice(i, 1);
                            _this.maxPage = Math.ceil(_this.songList.length / _this.itemNum);
                            if (_this.maxPage == 0) {
                                _this.maxPage = 1;
                            }
                            break;
                        }
                    }
                });
            },
            showPage: function(pageNum) {},
            nextPage: function() {
                if (this.currentPage < this.maxPage) {
                    this.showPage(++this.currentPage);
                }
            },
            prevPage: function() {
                if (this.currentPage > 1) {
                    this.showPage(--this.currentPage);
                }
            },
            deleteItem: function(index) {
                var deleteItem = this.songList[index],
                _this = this;
                g_fmChn.favSong.del(deleteItem.id, deleteItem.type,
                function() {
                    _this.songListMap[deleteItem.id] = false;
                    for (var i = 0; i < _this.songList.length; i++) {
                        if (_this.songList[i].id == deleteItem.id) {
                            _this.songList.splice(i, 1);
                            break;
                        }
                    }
                    _this.maxPage = Math.ceil(_this.songList.length / _this.itemNum);
                    if (_this.maxPage == 0) {
                        _this.maxPage = 1;
                    }
                    if (_this.currentPage <= _this.maxPage) {
                        _this.showPage(_this.currentPage);
                    } else {
                        _this.prevPage(_this.currentPage);
                    }
                });
            },
            show: function() {},
            playAll: function() {}
        },
        updateMyFavNum: function(fmNum, songNum) {},
        showUserInfo: function() {
            if (!g_user.isLogin()) {
                return;
            }
            g_user.getVipInfo(function(data) {
                if (data.vip != 1 && data.vip != 2) {
                    return;
                }
                g_fmChn.myFavFm.getList();
                g_fmChn.myFavSong.getList();
                g_fmChn._callback_counter++;
            });
        },
        shareFm: function(fmId, fmType, fmName) {
            fmType = fmType || g_fmChn._curFmInfo.fmType;
            fmId = fmId || g_fmChn._curFmInfo.fmId;
            fmName = fmName || g_fmChn._curFmInfo.fmName;
            var share_url = "http://fm.qq.com/#" + fmId + "_" + fmType;
            if (fmId == g_fmChn._curFmInfo.fmId && fmType == g_fmChn._curFmInfo.fmType && FM.lang.isHashMap(g_fmChn._curSongInfo)) {
                var malbumid = g_fmChn._curSongInfo.malbumid;
                g_share.shareToWeibo({
                    preopenwin: false,
                    url: share_url,
                    desc: '',
                    summary: '',
                    title: '#QQ音乐电台' + fmName + '频道#',
                    pic: 'http://imgcache.qq.com/music/photo/album/' + (malbumid % 100) + '/albumpic_' + malbumid + '_0.jpg'
                });
                g_fmChn.fm_stat(6);
            } else {
                g_share.openEmptyWindow("_shareFm");
                g_fmChn.getFmSongList(fmType, fmId,
                function(songlist) {
                    var malbumid = 0;
                    try {
                        if (songlist.length > 0) {
                            malbumid = songlist[0].malbumid;
                        }
                    } catch(e) {
                        malbumid = g_fmChn._curSongInfo.malbumid;
                    }
                    g_share.shareToWeibo({
                        preopenwin: true,
                        url: share_url,
                        desc: '',
                        summary: '',
                        title: '#QQ音乐电台' + fmName + '频道#',
                        pic: 'http://imgcache.qq.com/music/photo/album/' + (malbumid % 100) + '/albumpic_' + malbumid + '_0.jpg'
                    });
                    g_fmChn.fm_stat(6);
                });
            }
        },
        addOrDelFavFm: function(id, type, obj) {
            if (obj.className == "btn_fm_fav") {
                g_fmChn.addFavFm(id, type, obj);
            } else {
                g_fmChn.myFavFm.deleteFromMyFavFmList({
                    radioid: id,
                    type: type,
                    obj: obj
                });
            }
        },
        addFavFm: function(id, type, obj) {
            g_fmChn.myFavFm.addToMyFavFmList({
                radioid: id,
                type: type,
                obj: obj
            });
            g_fmChn.fm_stat(7);
        },
        goMyFavFmList: function() {
            g_fmChn.myFavFm.show();
        },
        goMyFavSongList: function() {
            g_fmChn.myFavSong.show();
            g_fmChn.fm_stat(9);
        },
        getSimSongList: function(history_list, callback) {
            var uin = g_user.getUin(),
            url = "",
            cbname = "SongRecCallback";
            url = "http://s.plcloud.music.qq.com/fcgi-bin/song_sim.fcg?start=-1&num=" + this._sim_song_num + "&uin=" + uin + "&history_list=" + history_list + "&rnd=" + new Date().valueOf();
            cbname = "SongRecCallback";
            function _error() {
                g_fmChn._isLoading = false;
            }
            function formatMusic(songdata) {
                var _arrSongAttr = ["mid", "msong", "msingerid", "msinger", "malbumid", "malbum", "msize", "minterval", "mstream", "mdownload", "msingertype", "size320", "size128", "mrate", "gososo", "sizeape", "sizeflac", "sizeogg"];
                var length = _arrSongAttr.length,
                arrMusic = songdata.split("|"),
                _obj = {},
                i = 0,
                _length = Math.min(length, arrMusic.length);
                for (i = 0; i < _length; i++) {
                    _obj[_arrSongAttr[i]] = arrMusic[i];
                }
                for (i = _length; i < length; i++) {
                    _obj[_arrSongAttr[i]] = "";
                }
                return _obj;
            };
            FM.loadJsonData("SimSongList", url,
            function(data) {
                var _songlist = [];
                if (data.retcode == 0) {
                    FM.object.each(data.songs,
                    function(info) {
                        var _data = formatMusic(unescape(unescape(info.data)).replace(/\+/ig, " "));
                        _data.mruleid = 100000000;
                        if (typeof data.rule_id != "undefined") {
                            _data.mruleid = data.rule_id;
                        }
                        if ( !! info.desc) {
                            _data.desc = info.desc;
                        } else {
                            _data.desc = "";
                        }
                        _songlist.push(_data);
                    });
                    if (_songlist.length <= 0) {
                        _error();
                        return;
                    }
                    if (callback) {
                        callback(_songlist);
                    }
                } else if (data.retcode == -2) {
                    g_user.callback = (function(history_list, callback) {
                        return function() {
                            g_fmChn.getSimSongList(history_list, callback);
                        }
                    })(history_list, callback);
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", cbname);
        },
        getFmSongList: function(fmType, fmId, callback) {
            var uin = g_user.getUin(),
            url = "",
            cbname = "";
            switch (parseInt(fmType)) {
            case 1:
            case 3:
                url = "http://radio.cloud.music.qq.com/fcgi-bin/qm_guessyoulike.fcg?start=-1&num=" + this._song_num + "&uin=" + uin + "&labelid=" + fmId + "&rnd=" + new Date().valueOf();
                cbname = "JsonCallBack";
                break;
            case 2:
                url = "http://radio.cloud.music.qq.com/fcgi-bin/fcg_singer_radio_client.fcg?start=-1&num=" + this._song_num + "&ouin=" + uin + "&singerid=" + fmId + "&rnd=" + new Date().valueOf();
                cbname = "JsonCallBack";
                break;
            case 100:
                if (uin < 10001) {
                    g_user.callback = (function(fmType, fmId, callback) {
                        return function() {
                            g_fmChn.getFmSongList(fmType, fmId, callback);
                        }
                    })(fmType, fmId, callback);
                    g_user.openLogin(null, 'self');
                    return;
                }
                g_fmChn.simrecord.getHistoryList(function(history_list) {
                    g_fmChn.getSimSongList(history_list, callback);
                });
                return;
                break;
            default:
                break;
            }
            function _error() {
                g_fmChn._isLoading = false;
            }
            function formatMusic(songdata) {
                var _arrSongAttr = ["mid", "msong", "msingerid", "msinger", "malbumid", "malbum", "msize", "minterval", "mstream", "mdownload", "msingertype", "size320", "size128", "mrate", "gososo", "sizeape", "sizeflac", "sizeogg"];
                var length = _arrSongAttr.length,
                arrMusic = songdata.split("|"),
                _obj = {},
                i = 0,
                _length = Math.min(length, arrMusic.length);
                for (i = 0; i < _length; i++) {
                    _obj[_arrSongAttr[i]] = arrMusic[i];
                }
                for (i = _length; i < length; i++) {
                    _obj[_arrSongAttr[i]] = "";
                }
                return _obj;
            };
            FM.loadJsonData("FmSongList", url,
            function(data) {
                var _songlist = [];
                if (data.retcode == 0) {
                    FM.object.each(data.songs,
                    function(info) {
                        var _data = formatMusic(unescape(unescape(info.data)).replace(/\+/ig, " "));
                        _data.mruleid = 100000000;
                        if (typeof data.rule_id != "undefined") {
                            _data.mruleid = data.rule_id;
                        }
                        _data.desc = "";
                        _songlist.push(_data);
                    });
                    if (_songlist.length <= 0) {
                        _error();
                        return;
                    }
                    if (callback) {
                        callback(_songlist);
                    }
                } else if (data.retcode == -2) {
                    g_user.callback = (function(fmType, fmId, callback) {
                        return function() {
                            g_fmChn.getFmSongList(fmType, fmId, callback);
                        }
                    })(fmType, fmId, callback);
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", cbname);
        },
        updateCurSong: function(songInfo) {
            g_fmChn._curSongInfo = songInfo;
            g_fmChn._divSongName.innerHTML = '<strong>' + songInfo.msong + '</strong> - <span>' + songInfo.msinger + '</span>';
            g_fmChn._divSongName.title = songInfo.msong.unescapeHTML() + ' - ' + songInfo.msinger.unescapeHTML();
            g_fmChn._divSongBarLine.style.width = '0%';
            FM.pic.change('http://ctc.imgcache.qq.com/music/photo/album/' + (songInfo.malbumid % 100) + '/albumpic_' + songInfo.malbumid + '_0.jpg');
        },
        updateSongBar: function(curtime, totaltime) {
            if (isNaN(curtime) || isNaN(totaltime)) {
                return;
            }
            function formatTime(seconds) {
                var mins = parseInt(seconds / 60, 10),
                secs = parseInt(seconds % 60, 10);
                return mins + ":" + (secs > 9 ? "": "0") + secs;
            }
            var pos = parseInt(curtime * 100 / totaltime, 10);
            g_fmChn._divSongBarLine.style.width = pos + '%';
        },
        initVol: function(vol) {
            var D = FM.dom,
            E = FM.event,
            volumebar = D.get("spanvolumebar"),
            volumesliderline = D.get("spanvolumeline"),
            volumesliderpoint = D.get("spanvolumepoint");
            volumebar.title = "音量：" + vol + "%";
            volumesliderline.style.height = vol + "%";
            volumesliderpoint.style.bottom = vol + "%";
        },
        mousedown: function(e) {
            FM.event.cancelBubble(e);
            FM.event.preventDefault(e);
            FM.event.addEvent(document.body, "mousemove", g_fmChn.mousemove);
            FM.event.addEvent(document.body, "mouseup",
            function() {
                FM.event.removeEvent(document.body, "mousemove", g_fmChn.mousemove);
            });
        },
        mousemove: function(event) {
            FM.event.cancelBubble(event);
            FM.event.preventDefault(event);
            FM.event.addEvent(document.body, "mouseup",
            function() {
                FM.event.removeEvent(document.body, "mousemove", g_fmChn.mousemove);
            });
            g_fmChn.updateVol();
        },
        updateVol: function() {
            var D = FM.dom,
            E = FM.event,
            volumebar = D.get("spanvolumebar"),
            volumesliderline = D.get("spanvolumeline"),
            volumesliderpoint = D.get("spanvolumepoint"),
            pos = D.getPosition(volumebar),
            eventy = E.mouseY(),
            vol = parseInt((pos["bottom"] - eventy - 1) * 100 / pos["height"], 10);
            if (!isNaN(vol) && (vol >= 0 && vol < 101)) {
                volumebar.title = "音量：" + vol + "%";
                volumesliderline.style.height = vol + "%";
                volumesliderpoint.style.bottom = vol + "%";
                g_webPlayer.setVolumn(vol);
                FM.setCookie('fmvol', vol);
            }
        },
        updateCurFm: function(fmInfo) {
            g_fmChn._curFmInfo = fmInfo;
        },
        fm_stat: function(optcode, ltime) {
            if (!g_fmChn._curSongInfo) {
                return;
            }
            var source = (g_fmChn.isPengyou ? 2 : 0);
            var ttime = 0;
            if ( !! ltime) {
                ttime = ltime;
            }
        },
        playFm: function(fmInfo) {
            g_fmChn._isLoading = true;
            function _playFm() {
                g_fmChn.getFmSongList(fmInfo.fmType, fmInfo.fmId,
                function(songlist) {
                    g_webPlayer.OnSongPlayBegin = function(songinfo, index, total) {
                        g_fmChn.updateCurSong(songinfo);
                        if (g_fmChn.myFavSong.isInSongList(songinfo.mid)) {
                            g_fmChn._btnLike.onclick = g_fmChn.delSong;
                            g_fmChn._btnLike.className = "btn_like current";
                            g_fmChn._btnLike.title = "取消喜欢";
                        } else {
                            g_fmChn._btnLike.onclick = g_fmChn.likeSong;
                            g_fmChn._btnLike.className = "btn_like";
                            g_fmChn._btnLike.title = "喜欢";
                        }
                        if (index >= total - 1) {
                            g_fmChn._isPlayNow = false;
                            _playFm();
                        }
                    }
                    g_webPlayer.OnSongPlayEnd = function(songinfo, index, total) {
                        if (g_fmChn._statArr[0] != '') {
                            if ((new Date().valueOf()) % 100 == 0) {}
                            for (var i = 0; i < g_fmChn._statArrNum; i++) {
                                g_fmChn._statArr[i] = '';
                            }
                        }
                        var pt = g_fmChn.playtime.get();
                        if (songinfo.mid != 0) {
                            g_fmChn.listenrecord.add({
                                songid: songinfo.mid,
                                playtime: pt + '',
                                source: '109',
                                actionid: '2'
                            });
                            if (g_fmChn._curFmInfo.fmType == 100) {
                                g_fmChn.simrecord.add({
                                    songid: songinfo.mid,
                                    actionid: '2',
                                    playtime: pt + '',
                                    source: '109'
                                });
                            }
                        }
                        g_fmChn.fm_stat(1, pt);
                        g_fmChn.playtime.end();
                    }
                    g_webPlayer.OnSongPlaying = g_fmChn.updateSongBar;
                    g_webPlayer.OnPlaying = function() {
                        g_fmChn._btnPlay.className = "bar_btn_pause";
                        g_fmChn._btnPlay.innerHTML = '<a href="javascript:;">暂停</a>';
                        g_fmChn._btnPlay.title = "暂停";
                        g_fmChn._btnPlay.onclick = g_fmChn.pauseFm;
                        if (g_fmChn._isFirstInit) {
                            var vol = FM.getCookie('fmvol') || '50';
                            g_fmChn.initVol(vol);
                            g_webPlayer.setVolumn(vol);
                            g_fmChn._isFirstInit = false;
                        } else {
                            g_fmChn.initVol(Math.round(g_webPlayer.getVolumn()));
                        }
                    }
                    g_webPlayer.OnPlayPause = function() {
                        g_fmChn._btnPlay.className = "bar_btn_play";
                        g_fmChn._btnPlay.innerHTML = '<a href="javascript:;">播放</a>';
                        g_fmChn._btnPlay.title = '播放';
                        g_fmChn._btnPlay.onclick = g_fmChn.startFm;
                    }
                    g_webPlayer.setPlayerList(g_fmChn._isPlayNow, songlist, 2);
                    if (g_fmChn._isFirstInit) {
                        if (!g_fmChn._isPlayNow && !g_fmChn._isResumeMusic) {
                            try {
                                var playerList = g_webPlayer.getPlayerList();
                                g_webPlayer.setSongInfoObj(playerList.getSongInfoObj());
                                g_fmChn.updateCurSong(playerList.getSongInfoObj());
                            } catch(e) {}
                            g_fmChn._btnLike.onclick = g_fmChn.likeSong;
                            g_fmChn._btnLike.className = "btn_like";
                            g_fmChn._btnLike.title = "喜欢";
                            g_fmChn._btnPlay.className = "bar_btn_play";
                            g_fmChn._btnPlay.innerHTML = '<a href="javascript:;">播放</a>';
                            g_fmChn._btnPlay.title = '播放';
                            g_fmChn._btnPlay.onclick = g_webPlayer.nextPlayer;
                            var vol = FM.getCookie('fmvol') || '50';
                            g_fmChn.initVol(vol);
                            g_webPlayer.setVolumn(vol);
                            g_fmChn._isFirstInit = false;
                        } else if (g_fmChn._isResumeMusic) {
                            g_fmChn._btnLike.onclick = g_fmChn.likeSong;
                            g_fmChn._btnLike.className = "btn_like";
                            g_fmChn._btnLike.title = "喜欢";
                            try {
                                g_fmChn._btnPlay.className = "bar_btn_pause";
                                g_fmChn._btnPlay.innerHTML = '<a href="javascript:;">暂停</a>';
                                g_fmChn._btnPlay.title = "暂停";
                                g_fmChn._btnPlay.onclick = g_fmChn.pauseFm;
                            } catch(e) {}
                        }
                    } else {
                        g_fmChn.initVol(Math.round(g_webPlayer.getVolumn()));
                    }
                    g_fmChn._isLoading = false;
                });
            }
            g_fmChn.updateCurFm(fmInfo);
            _playFm();
        },
        startFm: function() {
            if ( !! FM.BQQPlayer && FM.pauseFromApp) {
                FM.pauseFromApp = false;
                FM.pauseAppMusic();
                FM.BQQPlayer.runPlayerForce();
            } else {
                g_webPlayer.startPlayer();
            }
        },
        pauseFm: function() {
            g_webPlayer.pausePlayer();
        },
        playNext: function() {
            if (g_fmChn._isLoading) {
                return;
            }
            g_fmChn.fm_stat(5);
            if (g_fmChn._curFmInfo.fmType == 100) {
                g_fmChn._isPlayNow = true;
                g_fmChn.playFm(g_fmChn._curFmInfo);
            } else {
                g_webPlayer.nextPlayer();
            }
        },
        likeSong: function() {
            var url = 'http://stream' + g_fmChn._curSongInfo.mstream + '.qqmusic.qq.com/12' + g_fmChn._curSongInfo.mid + '.wma';
            g_fmChn.myFavSong.addToMyFavSongList({
                id: g_fmChn._curSongInfo.mid,
                type: 3,
                songname: g_fmChn._curSongInfo.msong,
                singername: g_fmChn._curSongInfo.msinger,
                diskname: g_fmChn._curSongInfo.malbum,
                url: url,
                singerid: g_fmChn._curSongInfo.msingerid,
                diskid: g_fmChn._curSongInfo.malbumid,
                playtime: g_fmChn._curSongInfo.minterval
            });
            var pt = g_fmChn.playtime.get();
            g_fmChn.listenrecord.add({
                songid: g_fmChn._curSongInfo.mid,
                playtime: pt + '',
                source: '104',
                actionid: '7'
            });
            if (g_fmChn._curFmInfo.fmType == 100) {
                g_fmChn.simrecord.add({
                    songid: g_fmChn._curSongInfo.mid,
                    actionid: '7',
                    playtime: pt + '',
                    source: '104'
                });
                g_fmChn._isPlayNow = false;
                g_fmChn.playFm(g_fmChn._curFmInfo);
            }
        },
        delSong: function() {
            g_fmChn.myFavSong.delFromFavSongList(g_fmChn._curSongInfo.mid, 3);
            var pt = g_fmChn.playtime.get();
            g_fmChn.listenrecord.add({
                songid: g_fmChn._curSongInfo.mid,
                playtime: pt + '',
                source: '102',
                actionid: '9'
            });
            if (g_fmChn._curFmInfo.fmType == 100) {
                g_fmChn.simrecord.add({
                    songid: g_fmChn._curSongInfo.mid,
                    actionid: '9',
                    playtime: pt + '',
                    source: '102'
                });
                g_fmChn._isPlayNow = false;
                g_fmChn.playFm(g_fmChn._curFmInfo);
            }
        },
        disLikeSong: function() {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.callback = (function() {
                    return function() {
                        g_fmChn.disLikeSong();
                    }
                })();
                g_user.openLogin(null, 'self');
                return false;
            }
            var pt = g_fmChn.playtime.get();
            g_fmChn.listenrecord.add({
                songid: g_fmChn._curSongInfo.mid,
                playtime: pt + '',
                source: '102',
                actionid: '6'
            });
            if (g_fmChn._curFmInfo.fmType == 100) {
                g_fmChn.simrecord.add({
                    songid: g_fmChn._curSongInfo.mid,
                    actionid: '6',
                    playtime: pt + '',
                    source: '102'
                });
            }
            g_fmChn.favSong.disLike(g_fmChn._curSongInfo.mid);
            this.playNext();
            g_fmChn.fm_stat(4);
        },
        shareMusic: function() {
            var _song_info = {};
            FM.object.extend(_song_info, g_fmChn._curSongInfo);
            g_trackServ.shareMusic(_song_info);
            var pt = g_fmChn.playtime.get();
            g_fmChn.listenrecord.add({
                songid: g_fmChn._curSongInfo.mid,
                playtime: pt + '',
                source: '106',
                actionid: '1'
            });
            if (g_fmChn._curFmInfo.fmType == 100) {
                g_fmChn.simrecord.add({
                    songid: g_fmChn._curSongInfo.mid,
                    actionid: '1',
                    playtime: pt + '',
                    source: '106'
                });
            }
        },
        showLyricTips: function() {
            g_trackServ.showLyricTips(g_fmChn._curSongInfo.mid);
        },
        guessYouLike: function(e) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.callback = (function() {
                    return function() {
                        window.location.href = 'http://fm.qq.com/#0_100';
                        g_fmChn.setCurChn(0, 100, g_fmChn._chnContainer['#0_100']);
                    }
                })();
                g_user.openLogin(null, 'self');
                FM.event.preventDefault(e);
                return false;
            }
            var target = FM.event.getTarget(e);
            this.setCurChn(0, 100, target);
        },
        showAllFmList: function(notInitScroll) {
            try {
                notInitScroll = notInitScroll || false;
                if (!notInitScroll) {
                    seajs.use('lib/jquery',
                    function($) {
                        $(".fm_fav").animate({
                            marginLeft: "167px"
                        },
                        (ua.ie == 7 || ua.ie == 8 ? 500 : "fast"), null,
                        function() {
                            $(".fm_fav").addClass("fm_fav_hide");
                            $(".fm_all_list").removeClass("fm_all_list_hide");
                            $(".icon_fm_station").hide();
                            $(".icon_fm_fav_current").hide();
                            $(".icon_fm_fav").show();
                            FM.scrollbar.init({
                                barid: "bar",
                                contid: "content",
                                bar_hover: "slider slider_hover",
                                ulid: g_fmChn._curChnList
                            });
                            PY.OZ.pingpv('/pengyou/fm/allFmList', 'app.music.qq.com');
                        });
                    });
                }
            } catch(e) {
                FM.console.print("showAllFmList exp:", e.message);
            }
        },
        showMyFavFmList: function() {
            seajs.use('lib/jquery',
            function($) {
                $(".fm_fav").animate({
                    marginLeft: "23px"
                },
                (ua.ie == 7 || ua.ie == 8 ? 500 : "fast"), null,
                function() {
                    $(".fm_all_list").addClass("fm_all_list_hide");
                    $(".fm_fav").removeClass("fm_fav_hide");
                    $(".icon_fm_fav").hide();
                    $(".icon_fm_station").show();
                    $(".icon_fm_fav_current").show();
                    g_fmChn.goMyFavFmList();
                });
            });
        },
        _curFavFm: null,
        playFavFm: function(fmId, fmType, obj) {
            if (!obj) {
                return;
            }
            try {
                FM.css.removeClassName(FM.dom.get("favfm_" + g_fmChn._curFmInfo.fmId + "_" + g_fmChn._curFmInfo.fmType), "current");
            } catch(e) {}
            try {
                this._curFavFm.parentNode.className = "";
            } catch(e) {}
            this._curFavFm = obj;
            FM.css.addClassName(obj.parentNode, "current");
            var fmInfo = {};
            fmInfo.fmType = fmType;
            fmInfo.fmId = fmId;
            fmInfo.fmName = this._fmNameObj[fmId + "_" + fmType];
            g_fmChn._isPlayNow = true;
            this.playFm(fmInfo);
            try {
                var node = g_fmChn._chnContainer['#' + fmId + '_' + fmType];
                g_fmChn._curChn.parentNode.className = "";
                g_fmChn._curChn = node;
                FM.css.addClassName(g_fmChn._curChn.parentNode, "current");
            } catch(e) {}
        },
        setChnAndList: function(fmId, fmType, resumeMusic, click, first) {
            click = click || false;
            first = first || false;
            this.showAllFmList(click);
            var node = this._chnContainer['#' + fmId + '_' + fmType];
            this.setCurChnType(this._fmListInfo[fmId + '_' + fmType], click, first);
            this.setCurChn(fmId, fmType, node, resumeMusic, click);
            if (fmType != 100 && !click) {
                FM.scrollbar.selectElement(node);
            }
        },
        setCurChn: function(fmId, fmType, node, resumeMusic, click) {
            click = click || false;
            this._curChn.parentNode.className = "";
            this._curChn = node;
            FM.css.addClassName(this._curChn.parentNode, "current");
            var fmInfo = {};
            fmInfo.fmType = fmType;
            fmInfo.fmId = fmId;
            fmInfo.fmName = this._fmNameObj[fmId + "_" + fmType];
            if (resumeMusic || g_fmChn._isFirstInit) {
                g_fmChn._isPlayNow = false;
            } else {
                g_fmChn._isPlayNow = true;
            }
            this.playFm(fmInfo);
        },
        setCurChnType: function(listId, notInitScroll, first) {
            if (!listId) {
                listId = 1;
            }
            notInitScroll = notInitScroll || false;
            this._curChnList.style.display = "none";
            this._curChnType = FM.dom.get("ch_" + listId);
            this._curChnList = FM.dom.get("content_" + listId);
            if (!first) {
                this._curChnList.style.display = "block";
            }
            if (!notInitScroll) {
                FM.scrollbar.init({
                    barid: "bar",
                    contid: "content",
                    bar_hover: "slider slider_hover",
                    ulid: this._curChnList
                });
            }
        },
        selectFmEvent: function() {
            var $ = FM,
            $D = $.dom,
            $E = $.event;
            $D.get('content').onclick = function(e) {
                var target = $E.getTarget(e);
                var hrefparts, _fmId, _fmType;
                if (target.nodeName === 'STRONG' || target.nodeName === 'EM') {
                    target = target.parentNode;
                }
                if (target.nodeName === 'SPAN') {
                    target = target.parentNode;
                }
                if (target.nodeName !== 'A') {
                    return;
                }
                hrefparts = target.href.split('#');
                hrefparts = hrefparts[hrefparts.length - 1].split('_');
                if (hrefparts.length < 2) {
                    return;
                }
                _fmId = hrefparts[0];
                _fmType = hrefparts[1];
                g_fmChn.setCurChn(_fmId, _fmType, target);
                $E.cancelBubble(e);
            };
            $D.get('ch_1').onclick = function(e) {
                var cont = $D.get('content_1');
                if (cont.style.display == "none") {
                    g_fmChn.setCurChnType(1);
                    $E.cancelBubble(e);
                    $E.preventDefault(e);
                } else {
                    cont.style.display = "none";
                }
            };
            $D.get('ch_2').onclick = function(e) {
                var cont = $D.get('content_2');
                if (cont.style.display == "none") {
                    g_fmChn.setCurChnType(2);
                    $E.cancelBubble(e);
                    $E.preventDefault(e);
                } else {
                    cont.style.display = "none";
                }
            };
            $D.get('ch_3').onclick = function(e) {
                var cont = $D.get('content_3');
                if (cont.style.display == "none") {
                    g_fmChn.setCurChnType(3);
                    $E.cancelBubble(e);
                    $E.preventDefault(e);
                } else {
                    cont.style.display = "none";
                }
            };
        },
        statArrPush: function() {
            for (var i = 0,
            len = arguments.length; i < len && i < g_fmChn._statArrNum; i++) {
                if (g_fmChn._statArr[i] != '') {
                    g_fmChn._statArr[i] += ',';
                }
                g_fmChn._statArr[i] += arguments[i];
            }
        },
        firstBuffered: function(startTime, endTime) {
            if (g_fmChn._statArr[0].split(',').length >= 10) {
                return;
            }
            var source = (g_fmChn.isPengyou ? 2 : 0);
            g_fmChn.statArrPush(g_fmChn._curFmInfo.fmId, g_fmChn._curFmInfo.fmType, g_fmChn._curSongInfo.mid, 11, source, endTime - startTime, g_fmChn._curSongInfo.mruleid);
        },
        secondBuffered: function(startTime, endTime) {
            if (g_fmChn._statArr[0].split(',').length >= 10) {
                return;
            }
            var source = (g_fmChn.isPengyou ? 2 : 0);
            g_fmChn.statArrPush(g_fmChn._curFmInfo.fmId, g_fmChn._curFmInfo.fmType, g_fmChn._curSongInfo.mid, 12, source, endTime - startTime, g_fmChn._curSongInfo.mruleid);
        }
    }
    window.g_fmChn = FM.channel.fm;
    FM.channel.fm.playtime = (function() {
        var playingC = 0;
        var curtime = 0;
        var totaltime = 0;
        function set(cur, total) {
            if (playingC > 0 && cur == 0) {
                return;
            }
            curtime = cur;
            if (playingC == 0) {
                totaltime = total;
            }
            playingC++;
        }
        function end() {
            playingC = 0;
            curtime = 0;
            totaltime = 0;
        }
        function get() {
            if (playingC == 0) {
                return 0;
            }
            if (playingC > 0 && curtime == 0) {
                return totaltime;
            }
            return curtime;
        }
        return {
            get: get,
            set: set,
            end: end
        }
    })();
    FM.channel.fm.favFm = {
        add: function(fmInfo, callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.callback = (function(fmInfo, callback) {
                    return function() {
                        g_fmChn.favFm.add(fmInfo, callback);
                    }
                })(fmInfo, callback);
                g_user.openLogin(null, 'self');
                return;
            }
            function _error() {
                FM.Tooltip.msg("收藏电台失败！当前网络繁忙，请您稍后重试。");
            }
            function _succ() {
                FM.Tooltip.success("收藏电台成功！");
                seajs.use('lib/jquery',
                function($) {
                    $(".counts_tips").show();
                    $(".icon_fm_fav_current").show();
                    $(".icon_fm_fav").hide();
                });
                setTimeout(function() {
                    seajs.use('lib/jquery',
                    function($) {
                        $(".counts_tips").hide();
                        $(".icon_fm_fav_current").hide();
                        $(".icon_fm_fav").show();
                    });
                },
                2000);
            }
            function _succ2() {
                FM.Tooltip.msg("您已经收藏过该电台！");
            }
            var url = "http://" + FM.domain["radio.cloud.music.qq.com"] + "/fcgi-bin/fcg_musicradio_add.fcg?uin=" + uin + "&radioid=" + fmInfo.fmId + "&owneruin=" + uin + "&type=" + fmInfo.fmType + "&out=1&rnd=" + new Date().valueOf();
            FM.loadJsonData("favFmadd", url,
            function(data) {
                if (data.code == 0) {
                    _succ();
                    if (callback) {
                        callback();
                    }
                    g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
                } else if (data.code == 6 || data.code == 9) {
                    _succ2();
                } else if (data.code == 2) {
                    g_user.callback = (function(fmInfo, callback) {
                        return function() {
                            g_fmChn.favFm.add(fmInfo, callback);
                        }
                    })(fmInfo, callback);
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "addMusicRadioCallback");
        },
        del: function(fmInfo, callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.callback = (function(fmInfo, callback) {
                    return function() {
                        g_fmChn.favFm.del(fmInfo, callback);
                    }
                })(fmInfo, callback);
                g_user.openLogin(null, 'self');
                return;
            }
            function _error() {
                FM.Tooltip.msg("删除电台失败！当前网络繁忙，请您稍后重试");
            }
            function _succ() {
                FM.Tooltip.success("删除电台成功！");
            }
            var url = "http://" + FM.domain["radio.cloud.music.qq.com"] + "/fcgi-bin/fcg_musicradio_delete.fcg",
            data = {
                uin: uin,
                radioid: fmInfo.fmId,
                owneruin: uin,
                type: fmInfo.fmType,
                out: 2,
                formsender: FM.isPengyou ? 3 : 1
            },
            fs = new FM.FormSender(url, "post", data, "GB2312");
            fs.onSuccess = function(o) {
                if (o.code == 0) {
                    _succ();
                    if (callback) {
                        callback(o);
                    }
                    g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
                } else if (o.code == 2) {
                    g_user.callback = (function(fmInfo, callback) {
                        return function() {
                            g_fmChn.favFm.del(fmInfo, callback);
                        }
                    })(fmInfo, callback);
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            };
            fs.onError = _error;
            fs.send();
        },
        getUserFavNum: function(callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.openLogin(null, 'self');
                return;
            }
            function _error() {}
            var url = "http://" + FM.domain["radio.cloud.music.qq.com"] + "/fcgi-bin/fcg_musicradiobyuin_getinfo.fcg?uin=" + uin + "&out=1&dirid=201&rnd=" + new Date().valueOf();
            FM.loadJsonData("getUserFavNum", url,
            function(data) {
                if (data.code == 0) {
                    if (callback) {
                        callback(data.num, data.song_num);
                    }
                } else if (data.code == 2) {
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "GetMusicRadioInfoByuinCallback");
        },
        getFmFavNum: function(fmInfo, callback) {
            function _error() {}
            var url = "http://" + FM.domain["radio.cloud.music.qq.com"] + "/fcgi-bin/fcg_musicradio_getinfo.fcg?radioid=" + fmInfo.fmId + "&type=" + fmInfo.fmType + "&out=1&rnd=" + new Date().valueOf();
            FM.loadJsonData("getFmFavNum", url,
            function(data) {
                if (data.retcode == 0) {
                    callback();
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "jsonCallback");
        },
        getList: function(callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.openLogin(null, 'self');
                return;
            }
            function _error() {}
            var url = "http://" + FM.domain["radio.cloud.music.qq.com"] + "/fcgi-bin/fcg_musicradiolist_getinfo.fcg?uin=" + uin + "&out=1&rnd=" + new Date().valueOf();
            FM.loadJsonData("getList", url,
            function(data) {
                if (data.code == 0) {
                    if (callback) {
                        callback(data);
                    }
                } else if (data.code == 2) {
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "GetMusicRadioListInfoCallback");
        }
    };
    FM.channel.fm.favSong = {
        add: function(idlist, typelist, callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                FM.Tooltip.msg("您的登录已过期，请重新登录");
                FM.showLoginBox();
                return;
            }
            function _error() {
                FM.Tooltip.msg("操作失败，服务器繁忙，请稍后再试。");
            }
            function _succ() {
                FM.Tooltip.success("歌曲已喜欢，您可以在“我喜欢”歌单找到这首歌");
            }
            var url = "http://" + FM.domain["s.plcloud.music.qq.com"] + "/fcgi-bin/fcg_music_add2songdir.fcg";
            var data = {
                uin: FM.getLoginUin(),
                dirid: 201,
                idlist: idlist,
                source: 104,
                typelist: typelist,
                formsender: FM.isPengyou ? 3 : 1
            };
            var fs = new FM.FormSender(url, "post", data, "GB2312");
            fs.onSuccess = function(o) {
                switch (o.code) {
                case 0:
                    top.g_JData["likelistmap"] = 0;
                    _succ();
                    g_fmChn._btnLike.className = "btn_like current";
                    g_fmChn._btnLike.title = "取消喜欢";
                    g_fmChn._btnLike.onclick = g_fmChn.delSong;
                    if (callback) {
                        callback();
                    }
                    g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
                    g_fmChn.fm_stat(2);
                    break;
                case 1:
                    FM.Tooltip.msg("您的登录已过期，请重新登录");
                    FM.showLoginBox();
                    break;
                case 21:
                    FM.Tooltip.msg("“我喜欢”歌单已经超过最大上限1000首，请清理后再重新标记。");
                    break;
                default:
                    _error();
                    break;
                }
            };
            fs.onError = _error;
            fs.send();
        },
        del: function(idlist, typelist, callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                FM.Tooltip.msg("您的登录已过期，请重新登录");
                FM.showLoginBox();
                return;
            }
            function _error() {
                FM.Tooltip.msg("操作失败，服务器繁忙，请稍后再试。");
            }
            function _succ() {
                FM.Tooltip.success("歌曲已取消喜欢，并且从“我喜欢”歌单移除");
            }
            var url = "http://" + FM.domain["qzone-music.qq.com"] + "/fcg-bin/fcg_music_delbatchsong.fcg";
            var data = {
                uin: uin,
                dirid: 201,
                ids: idlist,
                source: 103,
                types: typelist,
                formsender: FM.isPengyou ? 3 : 1,
                flag: 2,
                from: 3
            };
            var fs = new FM.FormSender(url, "post", data, "GB2312");
            fs.onSuccess = function(o) {
                switch (o.code) {
                case 0:
                    top.g_JData["likelistmap"] = 0;
                    _succ();
                    if (idlist == g_fmChn._curSongInfo.mid) {
                        g_fmChn._btnLike.className = "btn_like";
                        g_fmChn._btnLike.title = "喜欢";
                        g_fmChn._btnLike.onclick = g_fmChn.likeSong;
                    }
                    if (callback) {
                        callback();
                    }
                    g_fmChn.updateMyFavNum(g_fmChn.myFavFm.idList.length, g_fmChn.myFavSong.songList.length);
                    g_fmChn.fm_stat(8);
                    break;
                case 1:
                    FM.Tooltip.msg("您的登录已过期，请重新登录");
                    FM.showLoginBox();
                    break;
                default:
                    _error();
                    break;
                }
            };
            fs.onError = _error;
            fs.send();
        },
        getList: function(callback) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.openLogin(null, 'self');
                return;
            }
            function _error() {}
            var url = "http://" + FM.domain["s.plcloud.music.qq.com"] + "/fcgi-bin/fcg_musiclist_getinfo.fcg?uin=" + uin + "&dirid=201&dirinfo=1&user=qqmusic&rnd=" + new Date().valueOf();
            FM.loadJsonData("favsonglist", url,
            function(data) {
                if (data.code == 0) {
                    if (callback) {
                        callback(data);
                    }
                } else if (data.code == 2) {
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "jsonCallback");
        },
        disLike: function(id) {
            var uin = g_user.getUin();
            if (uin < 10001) {
                g_user.callback = (function(id) {
                    return function() {
                        g_fmChn.favSong.disLike(id);
                    }
                })(id);
                g_user.openLogin(null, 'self');
                return;
            }
            function _error() {}
            var url = "http://" + FM.domain["portalcgi.music.qq.com"] + "/fcgi-bin/radio/cgi_radio_dislike.fcg?songid=" + id + "&rnd=" + new Date().valueOf();
            FM.loadJsonData("disLike", url,
            function(data) {
                if (data.code == 0) {} else if (data.code == 1) {
                    g_user.callback = (function(id) {
                        return function() {
                            g_fmChn.favSong.disLike(id);
                        }
                    })(id);
                    g_user.openLogin(null, 'self');
                } else {
                    _error();
                }
            },
            function() {
                _error();
            },
            true, "gb2312", "MusicJsonCallback");
        }
    };
    FM.channel.fm.listenrecord = (function() {
        var record_num = 100;
        var songidlist = [];
        var playtimelist = [];
        var sourcelist = [];
        var actionidlist = [];
        function formatStr() {
            return [songidlist.join(','), playtimelist.join(','), sourcelist.join(','), actionidlist.join(',')].join('|');
        }
        function get(callback) {
            var uin = g_user.getUin();
            g_storage.get('fmlistenrecord' + uin,
            function(record) {
                record = record || '';
                if (record != '') {
                    var arr = record.split('|');
                    songidlist = arr[0].split(',');
                    playtimelist = arr[1].split(',');
                    sourcelist = arr[2].split(',');
                    actionidlist = arr[3].split(',');
                } else {
                    clear();
                }
                callback();
            });
        }
        function set() {
            var uin = g_user.getUin();
            if (songidlist.length > 0) {
                g_storage.set('fmlistenrecord' + uin, formatStr());
            } else {
                g_storage.set('fmlistenrecord' + uin, '');
            }
        }
        function clear() {
            songidlist = [];
            playtimelist = [];
            sourcelist = [];
            actionidlist = [];
        }
        function add(obj) {
            if (! (typeof obj.songid != 'undefined') && (typeof obj.playtime != 'undefined') && (typeof obj.actionid != 'undefined') && !!obj.source) {
                return;
            }
            get(function() {
                songidlist.push(obj.songid);
                playtimelist.push(obj.playtime);
                sourcelist.push(obj.source);
                actionidlist.push(obj.actionid);
                if (songidlist.length > record_num) {
                    songidlist.splice(0, 1);
                    playtimelist.splice(0, 1);
                    sourcelist.splice(0, 1);
                    actionidlist.splice(0, 1);
                }
                set();
            });
        }
        function report() {}
        return {
            add: add,
            report: report
        }
    })();
    FM.miniPlayer = FM.miniPlayer || {};
    MUSIC.miniPlayer = MUSIC.miniPlayer || {};
    FM.miniPlayer.tpl = ['<div class="app_fm_player">', '<div class="album_cover" id="divsongcover">', '<a href="javascript:;" class="app_cover" style="cursor:default;"><img id="img_cover"  onerror="FM.pic.doImgErr(event)" /></a>', '<div class="music_info">', '<div class="mask"></div>', '<div class="album_op" style="display:none;">', '<a href="javascript:;" class="btn_album_fav">收藏</a>', '<a href="javascript:;" class="btn_album_share">分享</a>', '</div>', '<p id="divsongname"><strong><span id="span_cover_name"></span></strong>-<span id="span_cover_singer"></span></p>', '</div>', '</div>', '<div class="app_fm_bar">', '<a href="javascript:;" class="app_qmusic_logo"></a>', '<ul>', '<li class="bar_btn_like"><a href="javascript:;" class="btn_like" id="btnlike">喜欢</a></li>', '<li class="bar_btn_pause" id="btnplay"><a href="javascript:;">暂停</a></li>', '<li class="bar_btn_next" onclick="g_fmChn.playNext();"><a href="javascript:;" title="下一首">下一首</a></li>', '<li class="bar_btn_volume">', '<div class="volume_bar" id="volume_bar">', '<div class="volume_line" id="spanvolumebar" onmousedown="g_fmChn.mousedown();" onclick="g_fmChn.updateVol();">', '<div class="volume_size" style="height:50%;" id="spanvolumeline"></div>', '<i class="volume_point" style="bottom:50%;" id="spanvolumepoint"></i>', '</div>', '</div>', '<a href="javascript:;" title="音量">音量</a>', '</li>', '</ul>', '<a href="javascript:;" class="bar_btn_fm">FM</a>', '<a href="javascript:;" class="bar_btn_mlist" style="display:none">播放列表</a>', '</div>', '<div class="progress_bar">', '<div class="time_line" style="width:0%;" id="divsongbarline"></div>', '<!--i class="time_point" style="left:0%;" id="divsongbarpoint"></i-->', '</div>', '<div class="app_main" style="display:none;">', '<div class="app_tab">', '<a href="javascript:;" class="close_app_main" title="收起">收起</a>', '<ul>', '<li class="tab_fm" style="float:left;width:144px;"><a href="javascript:;"  style="cursor:default;text-decoration:none;position:relative;display:block;width:144px;height:30px;line-height:28px;text-align:center;border-right:solid 1px #d2d5d8;color:#999">FM</a></li>', '</ul>', '</div>', '<div class="app_content">', '<div class="fm_content">', '<div class="fm_fav fm_fav_hide" id="fm_fav">', '<p title="我的收藏"><a href="javascript:;" class="icon_fm_fav" id="icon_fm_fav">收藏</a><a href="javascript:;" class="icon_fm_fav_current" id="icon_fm_fav_current">收藏</a><span>我的收藏</span></p>', '<div class="counts_tips" id="counts_tips" style="display:none;">', '<p>+1</p>', '</div>', '<div class="fm_list_content" id="myfavfm_content">', '<ul class="fm_list" id="fm_fav_list">', '</ul>', '</div>', '<div class="scroll_bar" id="myfavfm_barp">', '<div class="scroll_current" style="height:100px;top:0px;" id="myfavfm_bar"></div>', '</div>', '</div>', '<div class="fm_all_list" id="fm_all">', '<p title="全部电台"><a href="javascript:;" class="icon_fm_station"></a><a href="javascript:;" class="icon_fm_station_current"></a><span>全部电台</span></p>', '<div class="fm_sort_content" id="div_content">', '<ul class="fm_sort_list" id="content">', '<li class="fm_sort">', '<a _href="#1" href="javascript:;" class="fm_sort_name" id="ch_1"><span>官方电台</span></a>', '<ul class="fm_list" id="content_1" style="display:none;">', '</ul>', '</li>', '<li class="fm_sort">', '<a _href="#3" href="javascript:;" class="fm_sort_name" id="ch_3"><span>情感电台</span></a>', '<ul class="fm_list" id="content_3" style="display:none;">', '</ul>', '</li>', '<li class="fm_sort">', '<a _href="#2" href="javascript:;" class="fm_sort_name" id="ch_2"><span>歌手电台</span></a>', '<ul class="fm_list" id="content_2" style="display:none;">', '</ul>', '</li>', '</ul>', '</div>', '<div class="scroll_bar" id="barp">', '<div class="scroll_current" style="height:100px;top:0px;" id="bar"></div>', '</div>', '</div>', '</div>', '</div>', '</div>', '</div>'].join('');
    FM.miniPlayer.init = function() {
        g_fmChn.init({
            fmInfoObj: {
                "type1": [{
                    "id": 201,
                    "name": "奥斯卡金曲",
                    "i": 1
                },
                {
                    "id": 198,
                    "name": "热歌",
                    "i": 1
                },
                {
                    "id": 118,
                    "name": "华语",
                    "i": 1
                },
                {
                    "id": 120,
                    "name": "欧美",
                    "i": 1
                },
                {
                    "id": 119,
                    "name": "粤语",
                    "i": 1
                },
                {
                    "id": 150,
                    "name": "韩语",
                    "i": 1
                },
                {
                    "id": 149,
                    "name": "日语",
                    "i": 1
                },
                {
                    "id": 168,
                    "name": "法语",
                    "i": 1
                },
                {
                    "id": 122,
                    "name": "70后",
                    "i": 1
                },
                {
                    "id": 123,
                    "name": "80后",
                    "i": 1
                },
                {
                    "id": 124,
                    "name": "90后",
                    "i": 1
                },
                {
                    "id": 174,
                    "name": "钢琴",
                    "i": 1
                },
                {
                    "id": 175,
                    "name": "木吉他",
                    "i": 1
                },
                {
                    "id": 176,
                    "name": "小提琴",
                    "i": 1
                },
                {
                    "id": 181,
                    "name": "萨克斯",
                    "i": 1
                },
                {
                    "id": 126,
                    "name": "新歌",
                    "i": 1
                },
                {
                    "id": 190,
                    "name": "中国风",
                    "i": 1
                },
                {
                    "id": 192,
                    "name": "旅行",
                    "i": 1
                },
                {
                    "id": 191,
                    "name": "春晚经典",
                    "i": 1
                },
                {
                    "id": 196,
                    "name": "格莱美",
                    "i": 1
                },
                {
                    "id": 188,
                    "name": "Billboard",
                    "i": 1
                },
                {
                    "id": 187,
                    "name": "电影原声",
                    "i": 1
                },
                {
                    "id": 189,
                    "name": "电视剧原声",
                    "i": 1
                },
                {
                    "id": 182,
                    "name": "2011精选",
                    "i": 1
                },
                {
                    "id": 179,
                    "name": "女声",
                    "i": 1
                },
                {
                    "id": 141,
                    "name": "咖啡屋",
                    "i": 1
                },
                {
                    "id": 180,
                    "name": "茗茶馆",
                    "i": 1
                },
                {
                    "id": 127,
                    "name": "经典",
                    "i": 1
                },
                {
                    "id": 148,
                    "name": "唱作人",
                    "i": 1
                },
                {
                    "id": 167,
                    "name": "网络流行",
                    "i": 1
                },
                {
                    "id": 144,
                    "name": "动漫",
                    "i": 1
                },
                {
                    "id": 157,
                    "name": "篮球",
                    "i": 1
                },
                {
                    "id": 158,
                    "name": "足球",
                    "i": 1
                },
                {
                    "id": 160,
                    "name": "早安",
                    "i": 1
                },
                {
                    "id": 161,
                    "name": "晚安",
                    "i": 1
                },
                {
                    "id": 142,
                    "name": "失眠",
                    "i": 1
                },
                {
                    "id": 159,
                    "name": "滚石三十年",
                    "i": 1
                },
                {
                    "id": 162,
                    "name": "苹果广告",
                    "i": 1
                },
                {
                    "id": 166,
                    "name": "儿歌",
                    "i": 1
                },
                {
                    "id": 146,
                    "name": "胎教",
                    "i": 1
                },
                {
                    "id": 185,
                    "name": "说唱",
                    "i": 1
                },
                {
                    "id": 186,
                    "name": "英伦",
                    "i": 1
                },
                {
                    "id": 183,
                    "name": "蓝调",
                    "i": 1
                },
                {
                    "id": 184,
                    "name": "Bossa Nova",
                    "i": 1
                },
                {
                    "id": 173,
                    "name": "R&B",
                    "i": 1
                },
                {
                    "id": 130,
                    "name": "流行摇滚",
                    "i": 1
                },
                {
                    "id": 132,
                    "name": "爵士",
                    "i": 1
                },
                {
                    "id": 133,
                    "name": "乡村",
                    "i": 1
                },
                {
                    "id": 129,
                    "name": "轻音乐",
                    "i": 1
                },
                {
                    "id": 134,
                    "name": "电子",
                    "i": 1
                },
                {
                    "id": 135,
                    "name": "慢摇",
                    "i": 1
                },
                {
                    "id": 131,
                    "name": "古典",
                    "i": 1
                }],
                "type2": [{
                    "id": 143,
                    "name": "陈奕迅",
                    "i": 2
                },
                {
                    "id": 4558,
                    "name": "周杰伦",
                    "i": 2
                },
                {
                    "id": 7080,
                    "name": "The Cranberries",
                    "i": 2
                },
                {
                    "id": 6494,
                    "name": "Whitney Houston",
                    "i": 2
                },
                {
                    "id": 44,
                    "name": "梁静茹",
                    "i": 2
                },
                {
                    "id": 6130,
                    "name": "凤飞飞",
                    "i": 2
                },
                {
                    "id": 11606,
                    "name": "林宥嘉",
                    "i": 2
                },
                {
                    "id": 264,
                    "name": "王菲",
                    "i": 2
                },
                {
                    "id": 112,
                    "name": "蔡健雅",
                    "i": 2
                },
                {
                    "id": 10,
                    "name": "陈绮贞",
                    "i": 2
                },
                {
                    "id": 74,
                    "name": "五月天",
                    "i": 2
                },
                {
                    "id": 16257,
                    "name": "Justin Bieber",
                    "i": 2
                },
                {
                    "id": 141,
                    "name": "张惠妹",
                    "i": 2
                },
                {
                    "id": 13769,
                    "name": "Lady GaGa",
                    "i": 2
                },
                {
                    "id": 5161,
                    "name": "久石让",
                    "i": 2
                },
                {
                    "id": 5675,
                    "name": "Super Junior",
                    "i": 2
                },
                {
                    "id": 4607,
                    "name": "张靓颖",
                    "i": 2
                },
                {
                    "id": 218,
                    "name": "S.H.E",
                    "i": 2
                },
                {
                    "id": 54,
                    "name": "莫文蔚",
                    "i": 2
                },
                {
                    "id": 4880,
                    "name": "Eminem",
                    "i": 2
                },
                {
                    "id": 4660,
                    "name": "Mariah Carey",
                    "i": 2
                },
                {
                    "id": 13203,
                    "name": "萧敬腾",
                    "i": 2
                },
                {
                    "id": 4286,
                    "name": "林俊杰",
                    "i": 2
                },
                {
                    "id": 118,
                    "name": "容祖儿",
                    "i": 2
                },
                {
                    "id": 4417,
                    "name": "Avril Lavigne",
                    "i": 2
                },
                {
                    "id": 126,
                    "name": "小野丽莎",
                    "i": 2
                },
                {
                    "id": 109,
                    "name": "孙燕姿",
                    "i": 2
                },
                {
                    "id": 5470,
                    "name": "白智英",
                    "i": 2
                },
                {
                    "id": 11424,
                    "name": "AKB48",
                    "i": 2
                },
                {
                    "id": 265,
                    "name": "王力宏",
                    "i": 2
                },
                {
                    "id": 13578,
                    "name": "BY2",
                    "i": 2
                },
                {
                    "id": 4620,
                    "name": "郑秀文",
                    "i": 2
                },
                {
                    "id": 101,
                    "name": "陶喆",
                    "i": 2
                },
                {
                    "id": 113,
                    "name": "Twins",
                    "i": 2
                },
                {
                    "id": 51,
                    "name": "刘若英",
                    "i": 2
                },
                {
                    "id": 3347,
                    "name": "古巨基",
                    "i": 2
                },
                {
                    "id": 146,
                    "name": "谢霆锋",
                    "i": 2
                },
                {
                    "id": 171,
                    "name": "杨千嬅",
                    "i": 2
                },
                {
                    "id": 5194,
                    "name": "MC梦",
                    "i": 2
                },
                {
                    "id": 5437,
                    "name": "岛谷瞳",
                    "i": 2
                },
                {
                    "id": 9426,
                    "name": "X Japan",
                    "i": 2
                },
                {
                    "id": 2924,
                    "name": "Jay-Z",
                    "i": 2
                },
                {
                    "id": 4615,
                    "name": "李宇春",
                    "i": 2
                },
                {
                    "id": 174,
                    "name": "张学友",
                    "i": 2
                },
                {
                    "id": 163,
                    "name": "刘德华",
                    "i": 2
                },
                {
                    "id": 4365,
                    "name": "周传雄",
                    "i": 2
                },
                {
                    "id": 159,
                    "name": "胡彦斌",
                    "i": 2
                },
                {
                    "id": 4411,
                    "name": "王筝",
                    "i": 2
                },
                {
                    "id": 11979,
                    "name": "丁当",
                    "i": 2
                },
                {
                    "id": 4740,
                    "name": "黄小琥",
                    "i": 2
                },
                {
                    "id": 5398,
                    "name": "倖田來未",
                    "i": 2
                },
                {
                    "id": 30873,
                    "name": "love solfege",
                    "i": 2
                },
                {
                    "id": 1496,
                    "name": "Green Day",
                    "i": 2
                },
                {
                    "id": 5302,
                    "name": "Muse",
                    "i": 2
                },
                {
                    "id": 230,
                    "name": "迪克牛仔",
                    "i": 2
                },
                {
                    "id": 219,
                    "name": "张敬轩",
                    "i": 2
                },
                {
                    "id": 4359,
                    "name": "潘玮柏",
                    "i": 2
                },
                {
                    "id": 6028,
                    "name": "A-Lin",
                    "i": 2
                },
                {
                    "id": 173,
                    "name": "陈慧琳",
                    "i": 2
                },
                {
                    "id": 4605,
                    "name": "弦子",
                    "i": 2
                },
                {
                    "id": 5422,
                    "name": "椎名林檎",
                    "i": 2
                },
                {
                    "id": 5087,
                    "name": "宇多田光",
                    "i": 2
                },
                {
                    "id": 965,
                    "name": "David Guetta",
                    "i": 2
                },
                {
                    "id": 89,
                    "name": "张震岳",
                    "i": 2
                },
                {
                    "id": 6415,
                    "name": "Evanescence",
                    "i": 2
                },
                {
                    "id": 6621,
                    "name": "曹格",
                    "i": 2
                },
                {
                    "id": 224,
                    "name": "张韶涵",
                    "i": 2
                },
                {
                    "id": 4518,
                    "name": "黑豹",
                    "i": 2
                },
                {
                    "id": 75,
                    "name": "伍佰",
                    "i": 2
                },
                {
                    "id": 5941,
                    "name": "旺福",
                    "i": 2
                },
                {
                    "id": 5195,
                    "name": "平井坚",
                    "i": 2
                },
                {
                    "id": 15370,
                    "name": "三枝夕夏",
                    "i": 2
                },
                {
                    "id": 5705,
                    "name": "岚",
                    "i": 2
                },
                {
                    "id": 11304,
                    "name": "Guns N'Roses",
                    "i": 2
                },
                {
                    "id": 1066,
                    "name": "方大同",
                    "i": 2
                },
                {
                    "id": 8440,
                    "name": "Florence + The Machine",
                    "i": 2
                },
                {
                    "id": 4651,
                    "name": "罗志祥",
                    "i": 2
                },
                {
                    "id": 11593,
                    "name": "Enrique Iglesias",
                    "i": 2
                },
                {
                    "id": 4604,
                    "name": "汪峰",
                    "i": 2
                },
                {
                    "id": 11626,
                    "name": "郭静",
                    "i": 2
                },
                {
                    "id": 5558,
                    "name": "张悬",
                    "i": 2
                },
                {
                    "id": 15961,
                    "name": "2NE1",
                    "i": 2
                },
                {
                    "id": 5438,
                    "name": "仓木麻衣",
                    "i": 2
                },
                {
                    "id": 14207,
                    "name": "IU",
                    "i": 2
                },
                {
                    "id": 4946,
                    "name": "The Eagles",
                    "i": 2
                },
                {
                    "id": 1577,
                    "name": "杨幂",
                    "i": 2
                },
                {
                    "id": 4736,
                    "name": "Akon",
                    "i": 2
                },
                {
                    "id": 4709,
                    "name": "Celine Dion",
                    "i": 2
                },
                {
                    "id": 167,
                    "name": "张信哲",
                    "i": 2
                },
                {
                    "id": 4351,
                    "name": "范玮琪",
                    "i": 2
                },
                {
                    "id": 4367,
                    "name": "王心凌",
                    "i": 2
                },
                {
                    "id": 5613,
                    "name": "H.O.T.",
                    "i": 2
                },
                {
                    "id": 13959,
                    "name": "2PM",
                    "i": 2
                },
                {
                    "id": 165,
                    "name": "萧亚轩",
                    "i": 2
                },
                {
                    "id": 5684,
                    "name": "w-inds.",
                    "i": 2
                },
                {
                    "id": 12492,
                    "name": "王若琳",
                    "i": 2
                },
                {
                    "id": 290,
                    "name": "Coldplay",
                    "i": 2
                },
                {
                    "id": 4681,
                    "name": "James Blunt",
                    "i": 2
                },
                {
                    "id": 4718,
                    "name": "Pink",
                    "i": 2
                },
                {
                    "id": 178,
                    "name": "吴克羣",
                    "i": 2
                },
                {
                    "id": 4658,
                    "name": "杨丞琳",
                    "i": 2
                },
                {
                    "id": 4422,
                    "name": "牛奶咖啡",
                    "i": 2
                },
                {
                    "id": 4983,
                    "name": "Maroon 5",
                    "i": 2
                },
                {
                    "id": 21414,
                    "name": "Bruno Mars",
                    "i": 2
                },
                {
                    "id": 12578,
                    "name": "Adele",
                    "i": 2
                },
                {
                    "id": 12855,
                    "name": "Lady Antebellum",
                    "i": 2
                },
                {
                    "id": 13841,
                    "name": "SHINee",
                    "i": 2
                },
                {
                    "id": 5595,
                    "name": "小事乐团",
                    "i": 2
                },
                {
                    "id": 4762,
                    "name": "Usher",
                    "i": 2
                },
                {
                    "id": 13948,
                    "name": "邓紫棋",
                    "i": 2
                },
                {
                    "id": 6966,
                    "name": "Rihanna",
                    "i": 2
                },
                {
                    "id": 4586,
                    "name": "Black Eyed Peas",
                    "i": 2
                },
                {
                    "id": 7221,
                    "name": "许嵩",
                    "i": 2
                },
                {
                    "id": 227,
                    "name": "蔡依林",
                    "i": 2
                },
                {
                    "id": 2923,
                    "name": "Linkin Park",
                    "i": 2
                },
                {
                    "id": 4708,
                    "name": "Britney Spears",
                    "i": 2
                },
                {
                    "id": 4716,
                    "name": "Madonna",
                    "i": 2
                },
                {
                    "id": 8394,
                    "name": "卢广仲",
                    "i": 2
                },
                {
                    "id": 4161,
                    "name": "Beyonce Knowles",
                    "i": 2
                },
                {
                    "id": 4404,
                    "name": "WestLife",
                    "i": 2
                },
                {
                    "id": 4712,
                    "name": "迈克尔·杰克逊",
                    "i": 2
                },
                {
                    "id": 11760,
                    "name": "Sara Bareilles",
                    "i": 2
                },
                {
                    "id": 11733,
                    "name": "BigBang",
                    "i": 2
                },
                {
                    "id": 11809,
                    "name": "少女时代",
                    "i": 2
                },
                {
                    "id": 4800,
                    "name": "滨崎步",
                    "i": 2
                },
                {
                    "id": 4915,
                    "name": "东方神起",
                    "i": 2
                },
                {
                    "id": 5484,
                    "name": "蔡妍",
                    "i": 2
                },
                {
                    "id": 4435,
                    "name": "宝儿",
                    "i": 2
                },
                {
                    "id": 4706,
                    "name": "Rain",
                    "i": 2
                },
                {
                    "id": 5829,
                    "name": "凤凰传奇",
                    "i": 2
                },
                {
                    "id": 11921,
                    "name": "Taylor Swift",
                    "i": 2
                },
                {
                    "id": 13157,
                    "name": "Katy Perry",
                    "i": 2
                },
                {
                    "id": 6033,
                    "name": "吴雨霏",
                    "i": 2
                },
                {
                    "id": 6499,
                    "name": "张杰",
                    "i": 2
                },
                {
                    "id": 11761,
                    "name": "筷子兄弟",
                    "i": 2
                },
                {
                    "id": 5924,
                    "name": "苏打绿",
                    "i": 2
                },
                {
                    "id": 1059,
                    "name": "何晟铭",
                    "i": 2
                },
                {
                    "id": 24833,
                    "name": "胡夏",
                    "i": 2
                },
                {
                    "id": 2,
                    "name": "BEYOND",
                    "i": 2
                },
                {
                    "id": 5371,
                    "name": "SARA",
                    "i": 2
                },
                {
                    "id": 7298,
                    "name": "陈瑞",
                    "i": 2
                },
                {
                    "id": 4713,
                    "name": "邓丽君",
                    "i": 2
                },
                {
                    "id": 4427,
                    "name": "信乐团",
                    "i": 2
                },
                {
                    "id": 139,
                    "name": "王杰",
                    "i": 2
                },
                {
                    "id": 62,
                    "name": "任贤齐",
                    "i": 2
                }],
                "type3": [{
                    "id": 136,
                    "name": "伤感",
                    "i": 3
                },
                {
                    "id": 137,
                    "name": "寂寞",
                    "i": 3
                },
                {
                    "id": 138,
                    "name": "甜蜜",
                    "i": 3
                },
                {
                    "id": 140,
                    "name": "快乐",
                    "i": 3
                },
                {
                    "id": 139,
                    "name": "励志",
                    "i": 3
                }]
            }
        });
		(function() {
            var jsList = ['lib/jquery', 'lib/pengyou'];
            seajs.use(jsList,
            function($, PY) {
                FM._timerAlbumCover = null;
                $(".album_cover").mouseover(function() {
                    if ( !! FM._timerAlbumCover) {
                        clearTimeout(FM._timerAlbumCover);
                    }
                });
                $(".album_cover").mouseout(function() {
                    FM._timerAlbumCover = setTimeout(function() {
                        $(".album_cover").hide();
                    },
                    300);
                });
                $(".app_fm_bar").mouseover(function() {
					//console.log("true");
                    if ( !! FM._timerAlbumCover) {
                        clearTimeout(FM._timerAlbumCover);
                    }
                    $(".album_cover").show();
                });
                $(".app_fm_bar").mouseout(function() {
                    FM._timerAlbumCover = setTimeout(function() {
                        $(".album_cover").hide();
                    },
                    300);
                });
                $(".bar_btn_volume").click(function() {
					alert("true");
                    var event = FM.event.getEvent();
                    FM.event.cancelBubble(event);
                    FM.event.preventDefault(event);
                    if ($(".volume_bar").hasClass("hover")) {
                        $(".volume_bar").removeClass("hover");
                        $(".bar_btn_volume>a").removeClass("current");
                    } else {
                        $(".volume_bar").addClass("hover");
                        $(".bar_btn_volume>a").addClass("current");
                    }
                });
                document.documentElement.onclick = function(e) {
                    var a = FM.dom.get("volume_bar");
                    var b = FM.dom.get("bar_btn_volume");
                    var e = window.event || e,
                    target = e.srcElement || e.target;
                    if (target != a) {
                        var target = target.parentNode;
                        while (target && target != a) {
                            target = target.parentNode;
                        }
                        if (!target) {
                            $(".volume_bar").removeClass("hover");
                            $(".bar_btn_volume>a").removeClass("current");
                        }
                    }
                }
                $(".fm_list li,.play_list_content ul li").hover(function() {
                    $(this).addClass("hover");
                },
                function() {
                    $(this).removeClass("hover");
                });
                $(".icon_fm_fav").click(function() {
                    g_fmChn.goMyFavFmList();
                    $(".fm_fav").removeClass("fm_fav_hide");
                    if (ua.ie < 9) {
                        $(".icon_fm_fav").hide();
                        $(".icon_fm_station").show();
                        $(".fm_all_list").addClass("fm_all_list_hide");
                        $(".fm_fav").removeClass("fm_fav_hide");
                        $(".icon_fm_fav_current").show();
                    }
                    $(".fm_fav").animate({
                        marginLeft: "23px"
                    },
                    (ua.ie == 7 || ua.ie == 8 ? 500 : "fast"), null,
                    function() {
                        $(".fm_all_list").addClass("fm_all_list_hide");
                        $(".fm_fav").removeClass("fm_fav_hide");
                        $(".icon_fm_fav").hide();
                        $(".icon_fm_station").show();
                        $(".icon_fm_fav_current").show();
                        g_fmChn.goMyFavFmList();
                    });
                    PY.OZ.pingpv('/pengyou/fm/favFmList', 'app.music.qq.com');
                });
                $(".icon_fm_station").click(function() {
                    if (ua.ie < 9) {
                        $(".icon_fm_station").hide();
                        $(".icon_fm_fav").show();
                        $(".fm_fav").addClass("fm_fav_hide");
                        $(".fm_all_list").css({
                            "marginLeft": "-165px"
                        });
                        $(".fm_all_list").removeClass("fm_all_list_hide");
                        $(".fm_all_list").animate({
                            marginLeft: "0px"
                        },
                        (ua.ie == 7 || ua.ie == 8 ? 500 : "fast"), null,
                        function() {});
                    }
                    $(".fm_fav").animate({
                        marginLeft: "167px"
                    },
                    (ua.ie == 7 || ua.ie == 8 ? 500 : "fast"), null,
                    function() {
                        $(".fm_fav").addClass("fm_fav_hide");
                        $(".fm_all_list").removeClass("fm_all_list_hide");
                        $(".icon_fm_station").hide();
                        $(".icon_fm_fav_current").hide();
                        $(".icon_fm_fav").show();
                        FM.scrollbar.init({
                            barid: "bar",
                            contid: "content",
                            bar_hover: "slider slider_hover",
                            ulid: g_fmChn._curChnList
                        });
                        PY.OZ.pingpv('/pengyou/fm/allFmList', 'app.music.qq.com');
                    });
                });
                $(".close_app_main").click(function() {
                    $(".app_main").hide();
                });
                $(".bar_btn_fm").mouseover(function() {
                    if ($(".app_main").css("display") != "none") {
                        var event = FM.event.getEvent();
                        FM.event.cancelBubble(event);
                        FM.event.preventDefault(event);
                        $(".album_cover").hide();
                    }
                });
                $(".bar_btn_fm").click(function() {
                    if ($(".app_main").css("display") == "none") {
                        $(".album_cover").hide();
                        $(".app_main").show(0,
                        function() {
                            if (g_fmChn._isFirstShow) {
                                g_fmChn._isFirstShow = false;
                                g_fmChn.showAllFmList();
                                g_fmChn.showUserInfo();
                            }
                        });
                        PY.OZ.pingpv('/pengyou/fm/openFmList', 'app.music.qq.com');
                    } else {
                        $(".app_main").hide();
                    }
                });
                PY.OZ.pingpv('/pengyou/fm/index', 'app.music.qq.com');
            })
        })();
    }
    FM.dom.getScrollTop = function(doc) {
        doc = doc || document;
        return Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
    };
    FM.dom.getClientHeight = function(doc) {
        doc = doc || document;
        var height = doc.innerHeight;
        var mode = doc.compatMode;
        if ((mode || ua.ie) && !ua.opera) {
            height = (mode == 'CSS1Compat') ? doc.documentElement.clientHeight: doc.body.clientHeight;
        }
        return height;
    };
    function _onChange() {
        FM.dom.hideElement(FM.g_miniPlayerDiv);
        setTimeout(function() {
            try {
                FM.g_miniPlayerDiv = FM.getElementInBody("div_miniPlayer", "div");
                var csstop = FM.dom.getScrollTop() + FM.dom.getClientHeight() - 38 + "px";
                FM.g_miniPlayerDiv.style.cssText = "width:185px;position:absolute;z-index:1;left:10px;top:" + csstop;
                FM.dom.showElement(FM.g_miniPlayerDiv);
            } catch(e) {
                FM.console.print("_onChange,exp:" + e.message);
            }
        },
        500);
    };
    FM.miniPlayer.bootstrap = MUSIC.miniPlayer.bootstrap = function() {
        FM.initMusic(function() {
            FM.g_miniPlayerDiv = FM.getElementInBody("div_miniPlayer", "div");
            FM.g_miniPlayerDiv.innerHTML = FM.miniPlayer.tpl;
            var csstop = FM.dom.getScrollTop() + FM.dom.getClientHeight() - 38 + "px";
            FM.g_miniPlayerDiv.style.cssText = "width:185px;position:absolute;z-index:1;left:10px;top:" + csstop;
            FM.event.addEvent(window, "scroll", _onChange);
            FM.event.addEvent(window, "resize", _onChange);
            setTimeout(FM.miniPlayer.init, 1000);
        });
    };
})();
/*  |xGv00|13741e5558b71427a6bf13b28c3b09cb */
