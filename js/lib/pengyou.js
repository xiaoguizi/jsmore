define(function(require, exports, module) {
    var $ = require('lib/jquery'),
    Module = module.constructor;
    var PY = window.PY || {};
    PY.UI = PY.UI || {};
    PY.config = function(key, value) {
        return PY.storage.call(seajs._data, 'config', key, value);
    };
    PY.init = function() {
        $('[placeholder]').live('focus',
        function(e) {
            var el = $(this),
            defValue = this.defaultValue,
            va = $.trim(el.val());
            if (va === defValue || va === '') {
                el.val('');
            }
        }).live('blur',
        function(e) {
            var el = $(this),
            defValue = this.defaultValue,
            va = $.trim(el.val());
            if (va === '') {
                el.val(defValue);
            }
        });
        $('[data-tip]').live({
            'mouseover': function(e) {
                var elemOri = e.currentTarget,
                elem, tip;
                if (elemOri.nodeType === 1) {
                    elem = $(elemOri);
                    tip = elemOri.getAttribute('title');
                    if (tip) {
                        elem.attr('title', '');
                        elem.attr('data-tip', tip);
                    } else {
                        tip = elem.attr('data-tip');
                    }
                    PY.Tooltip.show('info', tip, {
                        target: elem,
                        position: 'top center'
                    });
                }
            },
            'mouseout': function(e) {
                var elem = e.currentTarget;
                if (elem.nodeType === 1) {
                    PY.Tooltip.hide(elem);
                }
            }
        });
        $.fn.extend({
            showTip: function(mode, msg, config) {
                config = config || {};
                config.target = this;
                PY.Tooltip.show(mode, msg, config);
            },
            hideTip: function() {
                PY.Tooltip.show(this);
            }
        });
    };
    PY.module = function() {
        var module = {};
        function deferFactory() {
            this._defer = {};
        }
        deferFactory.prototype.defer = function(key) {
            key && !this._defer[key] && (this._defer[key] = $.Deferred());
            return key ? this._defer[key] : this._defer;
        };
        return function(key) {
            key && !module[key] && (module[key] = new deferFactory());
            return key ? module[key] : module;
        };
    } ();
    PY.debug = function() {
        if ((window.location.search.indexOf('seajs-debug') !== -1 || document.cookie.indexOf('seajs=1') !== -1)) {
            return true;
        }
        return false;
    };
    PY.log = (function() {
        var logPanel, logPanelBd;
        return function() {
            if (PY.debug()) {
                try {
                    if ($.browser.msie) {
                        console.log(([].slice.call(arguments)).join(''));
                    } else {
                        console.log(arguments);
                    }
                } catch(e) {
                    if (!logPanel) {
                        var id = "logPanel" + new Date().getTime();
                        var h = ['<div class="py-pop">', '<a class="close" href="#"><i class="icon i-pop-close j_close"></i></a>', '<div class="pop-inner">', '<div id="', id, '" class="pop-bd"></div>', '</div>', '</div>'].join('');
                        logPanel = $(h).css({
                            overflow: 'auto',
                            height: '150px',
                            position: 'fixed',
                            bottom: '0px',
                            right: '0px',
                            width: '300px'
                        }).appendTo(document.body);
                        logPanelBd = $('#' + id);
                        logPanel.delegate('.j_close', 'click',
                        function() {
                            logPanel.hide();
                        });
                        if ($.browser.msie && $.browser.version == 6) {
                            logPanel.css({
                                'right': '300px;'
                            });
                            logPanel.css({
                                'position': 'absolute',
                                'bottom': 'auto'
                            });
                            logPanel[0].style.setExpression('top', 'documentElement.scrollTop + documentElement.clientHeight-this.offsetHeight');
                        }
                    }
                    var t = ([].slice.call(arguments)).join('\t,\t') + '</br>';
                    logPanelBd.append(t);
                }
            }
        };
    })();
    PY.error = function(msg) {
        throw '错误：' + msg;
    };
    PY.tiptext = (function() {
        var _MSG = {
            'error': '看起来出了点小问题，请稍后再试。',
            'fatal': '服务器出了点问题，我们正在紧急修复。',
            'success': '提交成功'
        };
        return function(type) {
            type = (type || '').toLowerCase();
            return _MSG[type];
        };
    })();
    PY.staticPage = function(value) {
        var key = 'IsStaticPage',
        state;
        if (value !== undefined) {
            PY[key] = value;
        }
        state = key in PY ? PY[key] : false;
        return state;
    };
    PY.domains = (function() {
        var DOMAIN_MAP = PY._Domains;
        if (DOMAIN_MAP) {
            DOMAIN_MAP.feed_attach = DOMAIN_MAP.feed_attach || 'feedattach.' + DOMAIN_MAP.root;
            DOMAIN_MAP.feed = DOMAIN_MAP.feed || 'feed.' + DOMAIN_MAP.root;
            DOMAIN_MAP.appd = DOMAIN_MAP.appd || 'appd.' + DOMAIN_MAP.root;
            DOMAIN_MAP.adver = DOMAIN_MAP.adver || 'adver.' + DOMAIN_MAP.root;
            DOMAIN_MAP.ishare = DOMAIN_MAP.ishare || 'ishare.' + DOMAIN_MAP.root;
            DOMAIN_MAP.im = DOMAIN_MAP.im || 'im.' + DOMAIN_MAP.root;
            DOMAIN_MAP.drift = DOMAIN_MAP.drift || 'drift.' + DOMAIN_MAP.root;
            DOMAIN_MAP.b = DOMAIN_MAP.b || 'b.' + DOMAIN_MAP.root;
        }
        if (/qq.com/gi.test(location.host)) {
            DOMAIN_MAP = $.extend(DOMAIN_MAP, {
                ishare: 'sns.qzone.qq.com',
                drift: 'drift.qzone.qq.com',
                b: 'b.qzone.qq.com'
            });
        }
        return function(key) {
            if (DOMAIN_MAP.hasOwnProperty(key)) {
                return DOMAIN_MAP[key];
            }
        };
    })();
    PY.cuser = (function() {
        var CUSER = PY._CUSER || {};
        CUSER.isAlpha = CUSER && ((CUSER.bits & 0x1000) !== 0);
        var METHOD = {
            token: (function() {
                var tmp_skey = null,
                tmp_token = null;
                return function() {
                    var skey = PY.cookie('skey') || '',
                    hash = 5381,
                    token = tmp_token;
                    if (skey && skey !== tmp_skey) {
                        tmp_skey = skey;
                        var i = 0,
                        l = skey.length;
                        for (; i < l; ++i) {
                            hash += (hash << 5) + skey.charAt(i).charCodeAt();
                        }
                        tmp_token = token = hash & 0x7fffffff;
                    }
                    return token;
                };
            })(),
            isLogin: function() {
                var uin = PY.cuser('cookie');
            },
            isLive: function() {
                var cookieQQ = PY.cuser('cookie') * 1,
                pageQQ = PY.cuser('qq') * 1,
                rs = false;
                if (pageQQ === cookieQQ) {
                    rs = true;
                }
                return rs;
            },
            cookie: (function() {
                var validateQQ = function(qq) {
                    return /^[1-9]\d{4,11}$/.test(qq);
                };
                return function() {
                    var qq = PY.cookie('zzpaneluin') * 1,
                    rs = validateQQ(qq);
                    if (!rs) {
                        qq = (PY.cookie('uin') || '').substr(1) * 1;
                        rs = validateQQ(qq);
                    }
                    rs = rs ? qq: false;
                    return rs;
                };
            })()
        };
        return function(key) {
            var rs;
            if (CUSER.hasOwnProperty(key)) {
                rs = CUSER[key];
            } else if (METHOD.hasOwnProperty(key)) {
                rs = METHOD[key]();
            }
            return rs;
        };
    })();
    PY.ubbReplace = function(src, option) {
        if (!src) return '';
        var icdm = 'imgcache.qq.com';
        var op = {
            'xss': false,
            'image': 'all',
            'link': 'all',
            'img_max_width': 800,
            'pop': false
        };
        $.extend(op, option);
        op.xss && (src = PY.Helper.filterXSS(src));
        src = src.replace(/”/g, '"');
        src = src.replace(/\[em\]e(\d{1,4})\[\/em\]/g, "<img style='vertical-align:middle  !important' src='http://" + icdm + "/qzone/em/ve$1.gif'><wbr>");
        if (op.image != 'none') {
            var match = op.image == 'qq' ? /\[img\](http:\/\/.+?\.qq\.com\/.+?)\[\/img\]/g: /\[img\](http.+?)\[\/img\]/g;
            src = src.replace(match, "<img style='vertical-align:baseline !important' onload='DrawImage(this," + op.img_max_width + ",500)' class='ubb_img' src='$1'>");
            var match = op.image == 'qq' ? /\[img,\d{1,4},\d{1,4}\](http:\/\/.+?\.qq\.com\/.+?)\[\/img\]/g: /\[img,\d{1,4},\d{1,4}\](http.+?)\[\/img\]/g;
            src = src.replace(match, "<img style='vertical-align:baseline !important' onload='DrawImage(this," + op.img_max_width + ",500)' class='ubb_img' src='$1'>");
        }
        if (op.link != 'none') {
            var match = op.link == 'qq' ? /\[url=(http:\/\/.+?\.qq\.com\/.+?)\](.+?)\[\/url\]/ig: /\[url=(.*?)\](.+?)\[\/url\]/ig;
            if (op.pop && op.image != 'none') src = src.replace(match, "<a href='$1' target='_blank' class='popup_photo' title='点击查看大图'>$2</a>");
            else src = src.replace(match, "<a href='$1' target='_blank'>$2</a>");
        }
        var useless = [/\[ft=([^\]]+)\]/g, /\[\/ft\]/g, /\[B\]/g, /\[\/B\]/g, /\[M\]/g, /\[\/M\]/g, /\[U\]/g, /\[\/U\]/g, /\[I\]/g, /\[\/I\]/g, /\[R\]/g, /\[\/R\]/g, /\[ffg,([^\]]{0,20})\]/g];
        for (var i = 0; i < useless.length; i++) {
            src = src.replace(useless[i], '');
        }
        var useless = [/\[li\]/g, /\[\/li\]/g, /\[quote=([^\]]*)\]/g, /\[\/quote\]/g];
        for (var i = 0; i < useless.length; i++) {
            src = src.replace(useless[i], '<br />');
        }
        var useless = [[/\[flash.{0,15}\].{3,100}?\[\/flash\]/g, ' [视频] '], [/\[video.{0,25}\].{3,100}?\[\/video\]/g, ' [视频] '], [/\[audio.{0,25}\].{3,100}?\[\/audio\]/g, ' [音乐] '], [/\[music.{0,25}\].{3,100}?\[\/music\]/g, ' [音乐] '], [/\[qqshow.+?\].{3,300}?\[\/qqshow\]/g, ' [QQshow泡泡] ']];
        for (var i = 0; i < useless.length; i++) {
            src = src.replace(useless[i][0], useless[i][1]);
        }
        src = src.replace(/@\{uin:([0-9a-zA-Z]+)\s*,\s*nick\s*:\s*([^\},]*?)\s*\}/gi,
        function($0, $1, $2) {
            var url = isNaN($1 * 1) ? ('http://' + PY.domains('profile') + '/index.php?mod=profile&u=' + $1) : ('http://user.qzone.qq.com/' + $1),
            rs = '<a href="' + url + '" target="_blank">@' + $2 + '</a>';
            return rs;
        });
        src = src.replace(/@\{\s*uin\s*:\s*([0-9a-zA-Z]+)\s*,\s*nick\s*:\s*(.*?)\s*,\s*who\s*:\s*([1-2])\s*?\}/gi,
        function($0, $1, $2, $3) {
            var url, rs;
            switch ($3) {
            case '2':
                url = 'http://' + PY.domains('profile') + '/index.php?mod=profile&u=' + $1;
                break;
            case '1':
                url = 'http://user.qzone.qq.com/' + $1;
                break;
            case '3':
                url = 'http://t.qq.com/' + $1;
                break;
            default:
                url = '###';
            }
            rs = '<a href="' + url + '" target="_blank">@' + $2 + '</a>';
            return rs;
        });
        return src;
    };
    PY.storage = (function() {
        var _StorageClass = {
            key_config: '_ConfigKey',
            clear: function(obj) {
                var key = this[this.key_config];
                obj[key] = undefined;
                delete obj[key];
            }
        };
        return function(storeKey, key, value) {
            var configKey = storeKey,
            conf = this[configKey],
            rs,
            callee,
            args;
            if ($.isPlainObject(key)) {
                if (!conf) {
                    this[configKey] = key;
                } else {
                    args = arguments;
                    callee = args.callee;
                    for (var i in key) {
                        callee.call(this, storeKey, i, key[i]);
                    }
                }
                return false;
            }
            if (!conf) {
                conf = PY.Class.clone(_StorageClass);
                conf[_StorageClass.key_config] = configKey;
            }
            this[configKey] = conf;
            if (key) {
                if (value === undefined) {
                    rs = conf[key];
                } else {
                    conf[key] = value;
                    rs = conf;
                }
            } else {
                rs = conf;
            }
            return rs;
        };
    })();
    PY.uri = function(url) {
        var a = document.createElement('a'),
        rs = {};
        a.href = url;
        rs = {
            href: url,
            origin: undefined,
            protocol: a.protocol.replace(':', ''),
            hostname: a.hostname,
            host: a.hostname,
            port: a.port,
            search: a.search,
            pathname: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash,
            pathname: a.pathname.replace(/^([^\/])/, '/$1'),
            params: (function() {
                var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length,
                i = 0,
                s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })()
        };
        return rs;
    };
    PY.chunk = function(items, process, context, callback) {
        if ($.isArray(items)) {
            return PY.Array.chunk.apply(PY.Array, arguments);
        } else if (typeof(items) === 'object') {
            return PY.Object.chunk.apply(PY.Object, arguments);
        }
    };
    PY.cookie = function(name, value, options) {
        if (typeof value != 'undefined') {
            options = options || {
                'domain': PY.domains('cookie')
            };
            if (value === null) {
                value = '';
                options.expires = -1;
            }
            var expires = '';
            if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
                var date;
                if (typeof options.expires == 'number') {
                    date = new Date();
                    date.setTime(date.getTime() + (options.expires * 1000));
                } else {
                    date = options.expires;
                }
                expires = '; expires=' + date.toUTCString();
            }
            var path = options.path ? '; path=' + (options.path) : '';
            var domain = options.domain ? '; domain=' + (options.domain) : '';
            var secure = options.secure ? '; secure': '';
            document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
        } else {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = $.trim(cookies[i]);
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }
            return cookieValue;
        }
    };
    PY.getACSRFToken = function() {
        PY.log('PY.getACSRFToken即将被淘汰，请使用PY.cuser(\'token\')');
        return PY.cuser('token');
    };
    PY.getLogoUrl = function(uin, size) {
        PY.log('PY.getLogoUrl即将被淘汰，请使用PY.User.avatar');
        return PY.User.avatar(uin, size);
    };
    PY.User = {
        logout: function(adtag) {
            var url = 'http://' + PY.domains('main') + '/index.php?mod=login2&act=logout&g_tk=' + PY.cuser('token');
            if (adtag) {
                url += '&adtag=' + adtag;
            }
            window.location.href = url;
        },
        addFriend: function(hash, options) {
            seajs.use('common/Widget/AddFriend',
            function(AddFriend) {
                AddFriend.add(hash, options);
            });
            return false;
        },
        avatar: function(uin, size, defaultType) {
            if (defaultType) {
                var sex = defaultType == 1 ? 'male': 'female';
                return 'http://' + PY.domains('imgcache') + '/pengyou/client/' + sex + '-' + size + '.png';
            }
            if (typeof(uin) != 'string') {
                PY.log('wrong uin' + uin);
                return 'about:blank;';
            }
            var pyMod = parseInt(uin.slice( - 3), 16) % 10,
            config = {
                200 : true,
                100 : true,
                60 : true
            },
            size = config[size] ? size: 30;
            pyMod = pyMod == 0 || isNaN(pyMod) ? '': pyMod;
            return 'http://py' + pyMod + '.qlogo.cn/friend/' + uin + '/audited/' + size;
        },
        profileUrl: function(uin, params) {
            var url = 'http://' + PY.domains('profile') + '/index.php?mod=profile&u=' + uin;
            if (params) {
                if (params.type == 'selfIsProfile') {
                    if (uin == PY.cuser('hash')) {
                        url += '&view_type=profile';
                    }
                } else {
                    for (var i in params) {
                        url += '&' + i + '=' + params[i];
                    }
                }
            }
            return url;
        }
    };
    PY.Photo = {
        resize: function(img, config) {
            var params = Array.prototype.slice.apply(arguments);
            seajs.use('common/Image/ImageCtrl',
            function(Ctrl) {
                Ctrl.autoResize.apply(this, params);
            });
        },
        resizeUrl: (function() {
            var _defSize = ['b', 'm', 's'],
            _cusSplit = 'x';
            return function(str, size, crop) {
                size = size.toLowerCase();
                var rs = $.trim(str),
                subDomain,
                rgxSubDomain = /^(https?\:\/\/)([ab])([0-9]+)/,
                rgxSubDomainFix,
                domainSizefix = {
                    'o': 'b',
                    'b': 'b',
                    'm': 'b',
                    's': 'a'
                },
                isQQ = (rs.indexOf('.qq.com') !== -1),
                isWeibo = !isQQ && (rs.indexOf('.qpic.cn') !== -1 && rs.indexOf('/mblogpic/') !== -1),
                isDefaultSize = PY.Array.eqString(size, _defSize) === -1 ? false: true,
                cusSize;
                if (isQQ) {
                    if (!isDefaultSize) {
                        cusSize = size.split(_cusSplit);
                        size = 'b';
                    }
                    rs = rs.replace(/\/rurl4_[bms]=/, '/rurl4_' + (size === 'm' ? 'b': size) + '=');
                    if (size === 'm') {
                        rs = rs.replace('/http_imgload.cgi?', '/http_img208.cgi?');
                    } else {
                        rs = rs.replace(/\/http_img[a-z0-9]+\.cgi\?/, '/http_imgload.cgi?');
                    }
                    switch (size) {
                    case 'o':
                    case 'b':
                    case 'm':
                        rgxSubDomainFix = /\&b=([0-9]+)/;
                        break;
                    case 's':
                        rgxSubDomainFix = /\&a=([0-9]+)/;
                        break;
                    }
                    subDomain = rs.match(rgxSubDomainFix);
                    subDomain = (subDomain && subDomain[1]) || '';
                    rs = rs.replace(rgxSubDomain, '$1' + domainSizefix[size] + (subDomain || '$3'));
                    rs = rs.replace(/\/[abmo]\//, '/' + (size === 's' ? 'a': size) + '/');
                    if (size === 'o') {
                        rs = rs.replace(/(https?\:\/\/)([^\/]*)\//, '$1r.photo.store.qq.com/');
                    }
                    if (cusSize) {
                        rs = rs + (cusSize[0] ? '&w=' + $.trim(cusSize[0]) : '') + (cusSize[1] ? '&h=' + $.trim(cusSize[1]) : '') + (crop ? '&cf=2': '');
                    }
                } else if (isWeibo) {
                    var weiboSize = {
                        'b': '2000',
                        'm': '460',
                        's': '160'
                    };
                    if (isDefaultSize) {
                        rs = rs.replace(/\/[0-9]+$/, '/' + weiboSize[size]);
                    } else {
                        rs = rs;
                    }
                }
                return rs || 'about:blank';
            };
        })()
    };
    PY.resizePhotourl = PY.Photo.resizeUrl;
    PY.CSS = {
        add: function(css) {
            var sheet = document.createElement('style'),
            frag,
            head = document.getElementsByTagName("head")[0] || document.documentElement;
            sheet.type = 'text/css';
            if (sheet.styleSheet !== undefined) {
                sheet.styleSheet.cssText = css;
            } else {
                frag = document.createDocumentFragment();
                frag.appendChild(document.createTextNode(css));
                sheet.appendChild(frag);
            }
            head.insertBefore(sheet, head.firstChild);
            return sheet;
        }
    };
    PY.Class = {
        clone: function(obj, callback) {
            var F = function() {},
            rs;
            F.prototype = obj;
            rs = new F();
            callback && callback.call(rs);
            return rs;
        }
    };
    PY.Event = {
        _StoreEvent: {},
        get: function(e) {
            var ev;
            if ('event' in window) {
                ev = window.event;
            } else {
                ev = e;
                if (!ev) {
                    ev = this.get;
                    while (ev && ev.caller) {
                        ev = ev.caller;
                        if (!ev.caller) {
                            break;
                        }
                    }
                    ev = ev.arguments && ev.arguments[0];
                }
            }
            return ev;
        },
        target: function(e) {
            var ev = this.get(e),
            tar;
            if (ev) {
                tar = ev.target || ev.srcElement;
            }
            return tar;
        },
        add: function(name, fn) {
            var storeKey = '_StoreEvent',
            store = PY.Event[storeKey];
            store[name] = store[name] || [];
            if ($.isFunction(fn)) {
                store[name].push(fn);
            }
            return store[name];
        },
        fire: function(name, clean) {
            var storeKey = '_StoreEvent',
            store = PY.Event[storeKey],
            fns = store[name];
            if (fns) {
                var i = 0,
                l = fns.length;
                for (; i < l; ++i) {
                    fns[i]();
                }
                if (clean) {
                    delete store[name];
                }
            }
        }
    };
    PY.Array = {
        eqString: function(str, arr) {
            var plus = '|~~~|' + ( + new Date()) + '|~~~|',
            arrPlus = plus + arr.join(plus) + plus,
            strPlus = plus + str + plus,
            has,
            rs = -1,
            idx = arrPlus.indexOf(strPlus);
            has = idx === -1 ? false: true;
            if (has) {
                rs = arrPlus.substr(0, idx).split(plus).length - 1;
            }
            return rs;
        },
        chunk: function(items, process, context, callback) {
            var todo = [].concat.call(items),
            delay = 25;
            var ss = +new Date();
            setTimeout(function() {
                var start = +new Date();
                if (todo.length > 0) {
                    do {
                        process.call(context, todo.shift());
                    } while ( todo . length > 0 && ( + new Date () - start < 50));
                }
                if (todo.length > 0) {
                    setTimeout(arguments.callee, delay);
                } else if (callback) {
                    callback.call(context, items);
                }
            },
            delay);
        }
    };
    PY.Object = {
        chunk: function(items, process, context, callback, _oriItems) {
            var todo = _oriItems ? items: $.extend({},
            items),
            ori = _oriItems || items,
            delay = 25;
            var start = +new Date();
            for (var key in todo) {
                if (todo.hasOwnProperty(key)) {
                    if ( + new Date() - start < 50) {
                        delete todo[key];
                        process.call(context, ori[key], key);
                    } else {
                        break;
                    }
                }
            }
            if ($.isEmptyObject(todo)) {
                callback && callback.call(context, ori);
            } else {
                setTimeout(function() {
                    PY.Object.chunk(todo, process, context, callback, ori);
                },
                delay);
            }
        }
    };
    PY.String = {
        htmlEncode: function(html) {
            var div = document.createElement('div'),
            txt = document.createTextNode(html);
            div.appendChild(txt);
            return div.innerHTML;
        },
        ubbEncode: function(str) {},
        ubbDecode: function(ubb) {}
    };
    PY.Ajax = {
        request: function(conf) {
            conf.url = PY.Ajax._fitUrl(conf.url);
            var uri = PY.uri(conf.url),
            locationHost = location.host,
            cross = (!uri || uri.host === locationHost) ? false: true,
            cuin,
            xhr,
            uniqueID;
            var AJAX = PY.Ajax;
            var url = conf.url;
            conf.needLogin = typeof(conf.needLogin) == 'boolean' ? conf.needLogin: true;
            if (conf.needLogin && conf.checkLive !== false && !PY.staticPage() && !PY.cuser('isLive')) {
                AJAX._showReLogin();
                return false;
            }
            uniqueID = PY.Ajax._autoAbort(conf);
            if (!conf.dataType) {
                conf.dataType = 'json';
            }
            conf.data = conf.data || {};
            if (conf.data.REQUEST_TO == 'qzone') {
                delete conf.data.REQUEST_TO;
                conf.url = url + (url.indexOf('?') > -1 ? '&': '?') + 'g_tk=' + PY.cuser('token');
                conf.data = $.extend(conf.data, {
                    entryuin: PY.cuser('hash'),
                    noFormSender: 1,
                    plat: 'pengyou'
                });
            } else if (!conf.data.g_tk) {
                var cuin = PY.cookie('uin');
                conf.data = $.extend(conf.data, {
                    g_tk: PY.cuser('token'),
                    _skey: PY.cookie('skey'),
                    token_uin: cuin && cuin.substr(1)
                });
            }
            if (conf.dataType === 'jsonp') {
                conf.jsonp = conf.jsonp || 'cb';
                conf.cache = ('cache' in conf) ? conf.cache: false;
            }
            var tmp_flag = false,
            tmp_timeout_delay = 0,
            tmp_timeout = null;
            if (conf.dataType === 'jsonp' || conf.dataType === 'json') {
                var tmp_success = conf.success,
                tmp_start = new Date().getTime();
                if ((conf.dataType == 'jsonp' || conf.dataType == 'json') && conf.timeout > 0) {
                    tmp_timeout_delay = conf.timeout;
                    tmp_timeout = setTimeout(function() {
                        tmp_flag = true;
                        if (conf.error) {
                            conf.error(xhr, 'timeout');
                        }
                        if (conf.returnCode) {
                            var code = conf.returnCode;
                            if ($.isPlainObject(conf.returnCode)) {
                                code = conf.returnCode.code;
                            }
                            PY.OZ.returncode(code, 2, -12, 100, tmp_timeout_delay);
                        }
                    },
                    tmp_timeout_delay);
                    conf.timeout = 0;
                }
                conf.success = function(da) {
                    clearTimeout(tmp_timeout);
                    if (tmp_flag) {
                        return;
                    }
                    var err = da && (da.err || da.code || da.ret),
                    args = arguments,
                    tmp_end = new Date().getTime(),
                    tmp_delay = tmp_end - tmp_start;
                    if (da && (da.err === 0 || da.code === 0 || da.ret === 0)) {
                        err = 0;
                    }
                    if (conf.returnCode) {
                        var code = conf.returnCode,
                        sampling = 10;
                        if ($.isPlainObject(conf.returnCode)) {
                            code = conf.returnCode.code;
                            sampling = conf.returnCode.sampling;
                        }
                        sampling = sampling || 0;
                        if (err === 0) {
                            PY.OZ.returncode(code, 1, 0, sampling, tmp_delay);
                        } else {
                            PY.OZ.returncode(code, 2, err, 100, tmp_delay);
                        }
                    }
                    var verifyMode = ('autoVerify' in conf) ? conf.autoVerify: true;
                    if (verifyMode !== false) {
                        var needVerify;
                        if (verifyMode === true) {
                            needVerify = !!((err === -98 || err === -99 || (da && da.result && da.result.code == 37)));
                        } else {
                            var errCode = conf.autoVerifyCode;
                            if (!$.isArray(errCode)) {
                                errCode = [errCode];
                            }
                            needVerify = !!(PY.Array.eqString(da && da[verifyMode], errCode) !== -1);
                        }
                        if (needVerify) {
                            seajs.use('common/Dialog/Dialog',
                            function(Dialog) {
                                var dia = Dialog.open('verify', '', {
                                    onSubmitted: function(key) {
                                        conf.data = conf.data || {};
                                        var vkey;
                                        if (conf.autoVerifyKey) {
                                            vkey = conf.autoVerifyKey;
                                        } else if (da.result && da.result.code == 37) {
                                            vkey = 'verify';
                                        } else {
                                            vkey = 'valid_input';
                                        }
                                        conf.data[vkey] = key;
                                        PY.Ajax.request(conf);
                                    },
                                    onCanceled: function() {
                                        tmp_success && tmp_success.apply(null, args);
                                    }
                                });
                            });
                            return false;
                        }
                    } else if (conf.autoLogin !== false && err === -10) {
                        location.href = 'http://www.pengyou.com/';
                    } else if (conf.type === 'post' && err === 100001) {
                        seajs.use('common/Dialog/Dialog',
                        function(Dialog) {
                            var dia = Dialog.open('normal', (da && da.msg) || '系统正在维护中, 请稍后访问', {
                                showCancelButton: false
                            });
                        });
                        return false;
                    }
                    tmp_success && tmp_success.apply(null, args);
                };
            }
            var err_tmp = conf.error;
            conf.error = function(xhr) {
                if (xhr && xhr.readyState === 0 && xhr.statusText != 'timeout' && conf.dataType != 'jsonp') {
                    return false;
                }
                err_tmp && err_tmp.apply(null, arguments);
            };
            var refer = document.location.href;
            refer = refer.replace(/#(.*)?/, '');
            conf.headers = conf.headers || {};
            $.extend(conf.headers, {
                'py-refer': refer
            });
            if (conf.gbkframe) {
                AJAX._gbkframeRequest(conf, uri.host);
            } else if (!cross || conf.dataType == 'jsonp') {
                if (conf.jsonpCallback) {
                    xhr = AJAX._jsonpQueue.excute(conf);
                } else {
                    xhr = $.ajax(conf);
                }
                if (uniqueID) {
                    AJAX._uniqueXHR(uniqueID, xhr);
                }
                return xhr;
            } else {
                return AJAX._crossRequest(conf, uri.host);
            }
        },
        get: function(url, data, success, dataType) {
            if ($.isFunction(data)) {
                dataType = dataType || success;
                success = data;
                data = undefined;
            }
            return PY.Ajax.request({
                type: 'get',
                url: url,
                data: data,
                success: success,
                dataType: dataType
            });
        },
        post: function(url, data, success, dataType) {
            if ($.isFunction(data)) {
                dataType = dataType || success;
                success = data;
                data = undefined;
            }
            return PY.Ajax.request({
                type: 'post',
                url: url,
                data: data,
                success: success,
                dataType: dataType
            });
        },
        jsonp: function(conf) {
            conf.dataType = 'jsonp';
            return PY.Ajax.request(conf);
        },
        _fitUrl: function(url) {
            var rs = $.trim(url) || '';
            if (rs) {
                if (rs.indexOf('http://')) {
                    rs = 'http://' + PY.domains('api') + '/' + url.replace(/^[\/]+/, '');
                }
            }
            return rs;
        },
        _autoAbort: function(conf) {
            var ajax = PY.Ajax,
            uniqueID = ajax._getUniqueid(conf),
            oldXHR = uniqueID && ajax._uniqueXHR(uniqueID);
            if (uniqueID && oldXHR) {
                try {
                    if (oldXHR.readyState !== 0 && oldXHR.readyState !== 4) {
                        oldXHR.abort && oldXHR.abort.call(oldXHR);
                        PY.log('PY.Ajax.request:自动中断请求 ' + uniqueID + ' ', conf, oldXHR);
                    }
                } catch(e) {
                    PY.log('PY.Ajax.request:自动中断请求 ' + uniqueID + ' 出错！！！');
                }
            }
            return uniqueID;
        },
        _uniqueXHR: function(key, value) {
            var configKey = '_StoreUniqueXHR';
            return PY.storage.call(PY.Ajax, configKey, key, value);
        },
        _getUniqueid: function(conf) {
            var unique = conf.unique,
            id = unique;
            return id;
        },
        _jsonpQueue: {
            queuesMap: {},
            proxyCallback: function(queueObj, name, callback, params) {
                if (callback) {
                    callback.apply(window, params);
                }
                var queues = queueObj.queuesMap[name];
                if (queues.ajaxQueues.length > 0) {
                    var q = queues.ajaxQueues.shift();
                    $.ajax(q);
                } else {
                    queues.onsending = false;
                }
            },
            excute: function(conf) {
                var queues = this.queuesMap[conf.jsonpCallback],
                self = this,
                succCallback = conf.success,
                errorCallback = conf.error;
                conf.success = function(callback) {
                    self.proxyCallback(self, conf.jsonpCallback, succCallback, arguments);
                };
                conf.error = function(callback) {
                    self.proxyCallback(self, conf.jsonpCallback, errorCallback, arguments);
                };
                if (!queues) {
                    queues = this.queuesMap[conf.jsonpCallback] = {
                        ajaxQueues: [],
                        onsending: false
                    };
                }
                if (queues.onsending) {
                    queues.ajaxQueues.push(conf);
                } else {
                    queues.onsending = true;
                    return $.ajax(conf);
                }
            }
        },
        _crossRequest: (function() {
            var proxyPool = {};
            var RequestProxy = function(options) {
                options = options || {};
                var self = this,
                domain = options.domain,
                method = options.ajaxOpt && options.ajaxOpt.type && options.ajaxOpt.type.toUpperCase() || 'GET';
                this.isReady = false;
                this.callback = [];
                var iframe = document.createElement('iframe'),
                url = 'http://' + domain + '/p.htm',
                checkCount = 1;
                iframe.style.position = 'absolute';
                iframe.style.top = '-999px';
                iframe.style.height = '0px';
                document.body.insertBefore(iframe, document.body.firstChild);
                iframe.src = url;
                this.proxy = iframe;
                $(iframe).bind('load',
                function() {
                    PY.log('proxy ready: ' + domain);
                    self.isReady = true;
                    $.each(self.callback,
                    function(index, fn) {
                        fn(self.proxy);
                    });
                    self.callback = [];
                });
            };
            RequestProxy.prototype = {
                ready: function(fn) {
                    if (this.isReady) {
                        fn(this.proxy);
                    } else {
                        this.callback.push(fn);
                    }
                }
            };
            var getXHR = function(win) {
                var xhr;
                win = win || window;
                xhr = win.ActiveXObject ? new win.ActiveXObject("Microsoft.XMLHTTP") : new win.XMLHttpRequest();
                return xhr;
            };
            return function(conf, domain) {
                if ($.browser.msie) {
                    $.support.cors = true;
                }
                if (!domain) {
                    domain = PY.uri(conf.url).host;
                }
                var proxy = proxyPool[domain];
                proxyPool[domain] = proxy = proxy || new RequestProxy({
                    domain: domain,
                    ajaxOpt: conf
                });
                proxy.ready(function(p) {
                    var uniqueID = PY.Ajax._autoAbort(conf);
                    conf.xhr = function() {
                        var xhr = getXHR(p.contentWindow);
                        if (uniqueID) {
                            PY.Ajax._uniqueXHR(uniqueID, xhr);
                        }
                        return xhr;
                    };
                    $.ajax(conf);
                });
                return {};
            };
        })(),
        _gbkframeRequest: (function() {
            var createFrame = function(conf, domain) {
                var url = 'http://' + domain + '/p_gbk.htm',
                f = document.createElement('iframe');
                f.src = url;
                f.setAttribute('style', 'position:absolute;top:-9999px;left:-9999px;');
                f.id = 'J_FrameRequest_' + domain + '_' + ( + new Date());
                f.callback = function(data) {
                    conf.success(data);
                    $(this).remove();
                };
                f.postData = {
                    uri: conf.url,
                    method: conf.type,
                    data: conf.data
                };
                $('body').append(f);
            };
            return function(conf, domain) {
                createFrame(conf, domain);
            };
        })(),
        _showReLogin: function() {
            seajs.use('common/Dialog/Dialog',
            function(Dialog) {
                seajs.use('common/Dialog/LoginDialog',
                function(LoginDialog) {
                    LoginDialog.open();
                });
            });
        }
    };
    PY.Template = {
        parse: (function() {
            var cache = {};
            return function(str, data) {
                if (typeof str === 'function') {
                    return data ? str(data) : str;
                }
                var fn = !/\W/.test(str) ? cache[str] = cache[str] || arguments.callee.call(this, document.getElementById(str).innerHTML) : new Function("obj", "var p=[],print=function(){p.push.apply(p,arguments);};" + "with(obj){p.push('" + str.replace(/[\r\t\n]/g, " ").split("<%").join("\t").replace(/((^|%>)[^\t]*)'/g, "$1\r").replace(/\t=(.*?)%>/g, "',$1,'").split("\t").join("');").split("%>").join("p.push('").split("\r").join("\\'") + "');}return p.join('');");
                if (data) {
                    try {
                        return fn(data);
                    } catch(e) {
                        PY.log('begin： simpleTemplate 渲染出错：' + e.message);
                        PY.log(str);
                        PY.log(data);
                        PY.log('end： simpleTemplate 渲染出错');
                        return PY.debug() ? '模板渲染出错了，查看控制台详细错误信息': PY.tiptext('error');
                    }
                } else {
                    return fn;
                }
            };
        })()
    };
    PY.Tooltip = {
        _TipID: 'J_PYTooltip_',
        _TipDataKey: 'data-tipid',
        show: function(mode, msg, conf) {
            var args = [].slice.call(arguments),
            obj = PY.Tooltip;
            conf = args[args.length - 1];
            if ($.isPlainObject(conf)) {
                args = args.slice(0, -1);
            } else {
                conf = {};
            }
            msg = args[args.length - 1];
            args = args.slice(0, -1);
            if (!msg) {
                return PY.error('PY.Tooltip.show:没有提示信息可显示');
            }
            mode = args[args.length - 1] || 'info';
            var modeConfig = PY.Tooltip._getModeHTML(mode),
            html = conf.tpl || modeConfig.tpl,
            target = conf.hasOwnProperty('target') ? conf.target: PY.Event.target(),
            tip,
            tipContainer;
            conf.fixed = conf.fixed || modeConfig.fixed || {};
            conf.position = conf.position || modeConfig.position || 'top left';
            if (!target) {
                return obj.msg(msg);
            }
            target = $(target);
            tip = obj._getTip(target, html, msg);
            tipContainer = (target.get(0).ownerDocument || window.document).body;
            tip.hide().appendTo(tipContainer);
            tipOffset = obj._getTipOffset(target, tip, conf);
            tip.css({
                position: 'absolute',
                zIndex: 9999,
                top: tipOffset.top,
                left: tipOffset.left
            }).show();
            return tip;
        },
        hide: function(elem) {
            var obj = PY.Tooltip,
            idPlus = obj._TipID,
            dataKey = obj._TipDataKey;
            elem = $(elem || PY.Event.target());
            $('#' + idPlus + elem.attr(dataKey)).hide();
        },
        msg: (function() {
            var _Template = {
                'info': '<div id="<%=id%>" style="z-index:<%=zIndex%>" class="hint hint-blue"><div class="hint-inner"><i class="ico-hint ico-busy"></i><span class="hint-txt"><%=content%></span></div></div>',
                'error': '',
                'success': '<div id="<%=id%>" style="z-index:<%=zIndex%>" class="hint hint-green"><div class="hint-inner"><i class="ico-hint ico-hint-success"></i><span class="hint-txt"><%=content%></span></div></div>'
            };
            return function(type, msg, delay) {
                var args = [].slice.apply(arguments),
                tpl;
                delay = args[args.length - 1];
                if (typeof(delay) === 'number') {
                    args.splice( - 1, 1);
                } else {
                    delay = null;
                }
                if (args.length > 1) {
                    type = args[0];
                    msg = args[1];
                } else if (args.length === 1) {
                    type = null;
                    msg = args[0];
                } else {
                    type = null;
                    msg = '';
                }
                type = type || 'info';
                delay = delay || 1500;
                tpl = _Template[type] || _Template['info'];
                seajs.use('common/Dialog/Dialog.js',
                function(Dialog) {
                    var dia = Dialog.open(msg, {
                        autoClose: true,
                        useModal: false,
                        template: tpl,
                        autoCloseDelay: delay,
                        zIndex: 9999
                    });
                });
            };
        })(),
        success: function(msg) {
            return PY.Tooltip.msg('success', msg);
        },
        _getModeHTML: (function() {
            var _HTML = {
                info: {
                    tpl: '<div class="pop-tips">' + '<span class="arrow-down"></span><span class="arrow-down arrow-down-in"></span>' + '<div class="pop-tips-inner"><p class="tips-txt"><%=content%></p></div>' + '</div>',
                    position: 'top center',
                    fixed: {
                        height: 7
                    }
                }
            };
            return function(mode) {
                return _HTML[mode];
            };
        })(),
        _getTip: (function() {
            var TipCount = 0;
            return function(target, html, msg) {
                var obj = PY.Tooltip,
                tipID = obj._TipID,
                dataKey = obj._TipDataKey,
                targetTipID = target.attr(dataKey),
                tip;
                if (targetTipID) {
                    tip = $('#' + tipID + targetTipID);
                } else {
                    TipCount = TipCount + 1;
                    tip = $(PY.Template.parse(html, {
                        content: msg
                    }));
                    tip.attr('id', tipID + TipCount);
                    target.attr(dataKey, TipCount);
                }
                return tip;
            };
        })(),
        _getTipOffset: (function() {
            var PosText = 'top left right bottom center'.split(' ');
            return function(target, tip, config) {
                var fixed = config.fixed,
                position = config.position.split(' '),
                pos_top = $.trim(position[0] || 'top').toLowerCase(),
                pos_left = $.trim(position[1] || 'left').toLowerCase(),
                top,
                left,
                offset = target.offset(),
                metrics = {
                    width: target.outerWidth(),
                    height: target.outerHeight()
                },
                tipMetrics = {
                    width: tip.outerWidth() + (fixed.width || 0),
                    height: tip.outerHeight() + (fixed.height || 0)
                },
                tipOffset;
                if (PY.Array.eqString(pos_top, PosText) !== -1) {
                    switch (pos_top) {
                    case 'top':
                        top = offset.top - tipMetrics.height;
                        break;
                    case 'bottom':
                        top = offset.top + (metrics.height + (fixed.height || 0));
                        break;
                    case 'center':
                        top = offset.top + (metrics.height - tipMetrics.height) / 2;
                        break;
                    }
                } else {
                    top = pos_top;
                }
                if (PY.Array.eqString(pos_left, PosText) !== -1) {
                    switch (pos_left) {
                    case 'left':
                        left = offset.left;
                        break;
                    case 'right':
                        left = offset.left + metrics.width;
                        break;
                    case 'center':
                        left = offset.left + (metrics.width - tipMetrics.width) / 2;
                        break;
                    }
                } else {
                    left = pos_left;
                }
                tipOffset = {
                    top: top + (fixed.top || 0),
                    left: left + (fixed.left || 0)
                };
                return tipOffset;
            };
        })()
    };
    PY.OZ = {
        speedSet: function(f2, f3, id, value, basetime) {
            var key = f2 + '_' + f3,
            startTime, endTime, speed, loadTimes = PY.LoadTimes;
            if (!this[key]) {
                this[key] = [];
            }
            startTime = basetime || this[key][0] || loadTimes.startLoad;
            endTime = value || ( + new Date());
            if (id !== 0 && startTime !== undefined && startTime !== null) {
                speed = endTime - startTime;
            } else if (id === 0) {
                speed = endTime - 1 + 1;
            }
            if (speed !== undefined) {
                this[key][id] = speed;
            }
        },
        speedSend: function(f2, f3, setting) {
            setting = setting || {};
            var key = f2 + '_' + f3,
            data = this[key],
            _arr = [];
            if (!data || data.length <= 0) {
                return false;
            }
            for (var i = 1; i < data.length; i++) {
                if (data[i]) {
                    _arr.push(i + '=' + data[i]);
                }
            }
            var flags = [[f2, f3]],
            urls = [],
            copyTo = setting.copyTo;
            if (copyTo) {
                if ($.isArray(copyTo[0])) {
                    flags = flags.concat(copyTo);
                } else {
                    flags.push(copyTo);
                }
            }
            var i = 0,
            cur, times = _arr.join('&');
            for (; cur = flags[i++];) {
                urls.push("http://isdspeed.qq.com/cgi-bin/r.cgi?flag1=164&flag2=" + cur[0] + "&flag3=" + cur[1] + "&" + times);
            }
            var i = 0,
            l = urls.length;
            for (; i < l; ++i) {
                var imgSendTimePoint = new Image();
                imgSendTimePoint.src = urls[i];
                PY.log('speed report: ' + flags[i].join(','), _arr.join(','));
            }
            this[key] = [];
        },
        performance: function(f2, f3) {
            var f1 = 164;
            var timing, perf = (window.webkitPerformance ? window.webkitPerformance: window.msPerformance),
            perfMap = ["navigationStart", "unloadEventStart", "unloadEventEnd", "redirectStart", "redirectEnd", "fetchStart", "domainLookupStart", "domainLookupEnd", "connectStart", "connectEnd", "requestStart", "responseStart", "responseEnd", "domLoading", "domInteractive", "domContentLoadedEventStart", "domContentLoadedEventEnd", "domComplete", "loadEventStart", "loadEventEnd"],
            loadTimes = PY.LoadTimes,
            startLoad = loadTimes && PY.startLoad,
            reportData = [],
            navigationStart,
            _tmp;
            perf = (perf ? perf: window.performance);
            timing = perf && perf.timing;
            if (timing) {
                if (typeof(timing.msFirstPaint) != 'undefined') {
                    perfMap.push('msFirstPaint');
                    if ($.isPlainObject(f3) && f3.ie) {
                        f3 = f3.ie;
                    }
                } else {
                    if ($.isPlainObject(f3) && f3.chrome) {
                        f3 = f3.chrome;
                    }
                }
                navigationStart = timing[perfMap[0]];
                var i = 0,
                cur, tmp;
                var i = 1,
                l = perfMap.length;
                for (; i < l; ++i) {
                    tmp = timing[perfMap[i]];
                    if (tmp && tmp > 0) {
                        tmp = tmp - navigationStart;
                        reportData.push(i + '=' + tmp);
                    }
                    tmp = null;
                }
                if (startLoad) {
                    reportData.push('30=' + (startLoad - navigationStart));
                }
                var url = 'http://isdspeed.qq.com/cgi-bin/r.cgi?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + reportData.join('&');
                var _img = new Image();
                setTimeout(function() {
                    _img.src = url;
                    PY.log('Speed Performance Report(f3=' + f3 + '):', reportData.join(','));
                },
                0);
            }
        },
        returncode: function(flag1, flag2, flag3, sampling, delay) {
            sampling = sampling || 100;
            if (sampling < 100) {
                if (Math.floor(Math.random() * 100) >= sampling) {
                    return;
                }
            }
            sampling = Math.ceil(100 / sampling);
            delay = delay || 0;
            flag2 = flag2 || 1;
            var url = "http://isdspeed.qq.com/cgi-bin/v.cgi?flag1=" + flag1 + "&flag2=" + flag2 + "&1=" + sampling + "&2=" + delay;
            if (flag3) {
                url += "&flag3=" + flag3;
            }
            var imgSend = new Image();
            setTimeout(function() {
                imgSend.src = url;
            },
            0);
        },
        report: function(id) {
            var args = [].slice.call(arguments),
            str = args.slice(1);
            if (str && str.length > 0) {
                str = str && str.join(',');
                new Image().src = 'http://s.isdspeed.qq.com/cgi-bin/s.fcg?dataId=1000021&bid=' + id + '&rc=' + encodeURIComponent(str);
            }
        },
        pingpv: function() {
            var args = [].slice.apply(arguments);
            seajs.use('module/ping/ping',
            function(p) {
                PY.log('PY.OZ.pingpv:', args.join(','));
                p.pingpv.apply(p, args);
            });
        },
        pgvUrl: function() {
            var args = [].slice.apply(arguments);
            seajs.use('module/ping/ping',
            function(p) {
                PY.log('PY.OZ.pgvUrl:', args.join(','));
                p.pgvUrl.apply(p, args);
            });
        }
    };
    PY.Helper = {
        getURLArgs: function(str, k) {
            str = (str) ? str: location.href;
            var s = str.indexOf('?');
            var e = (str.indexOf('#') == -1) ? str.length: str.indexOf('#');
            var r = {};
            if (s != -1) {
                var ts = str.substring(s + 1, e);
                ts = ts.split('&');
                var t;
                for (var i = 0; i < ts.length; i++) {
                    t = ts[i].split('=');
                    if (t.length == 2) {
                        r[t[0]] = t[1];
                    }
                }
            }
            if (k) return (r[k] ? r[k] : false);
            return r;
        },
        isEmpty: function(v) {
            if (v != null && (typeof(v) == 'object' || typeof(v) == 'function')) {
                if ($.isArray(v) && v.length == 0) {
                    return true;
                }
                return false;
            }
            return (('' == v || undefined == v || null == v) ? true: false);
        },
        getUin: function() {
            var uin = parseInt(PY.cookie('zzpaneluin'), 10);
            if (this.vaildateUin(uin)) return uin;
            uin = PY.cookie('uin') || '';
            uin = parseInt(uin.replace(/^o(0)*/, ''), 10);
            return (this.vaildateUin(uin) ? uin: false);
        },
        vaildateUin: function(uin) {
            return /^[1-9]\d{4,11}$/.test(uin);
        },
        filterXSS: function(cont) {
            cont = cont.replace(/&/g, '&amp;');
            cont = cont.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            cont = cont.replace(/\'/g, '&#39;').replace(/\"/g, '&quot;');
            return cont;
        },
        str2Args: function(query, split) {
            var args = {};
            query = query || '';
            split = split || '&';
            var pairs = query.split(split);
            for (var i = 0; i < pairs.length; i++) {
                var pos = pairs[i].indexOf('=');
                if (pos == -1) {
                    continue;
                }
                var argname = pairs[i].substring(0, pos);
                var value = pairs[i].substring(pos + 1);
                args[argname] = value;
            }
            return args;
        }
    };
    PY.helper = PY.Helper;
    PY.init();
    PY.$ = $;
    return PY;
});
/*  |xGv00|06402389fdbb0d66ed266c1a1a25c139 */
