/**
 * koala 底层库文件
 * version = '1.0.0'
 * 
 */

this.gui = function () {
	_gui = this.gui;
};
gui.version = '1.0.0';
gui._data = {
	config: {
		debug: '%DEBUG%',
		preload: []
	},
	memoizedMods: {},
	pendingMods: []
};
gui._util = {};
gui._fn = {};

/**
 * [ 常用方法 ]
 * @param  {[type]} util [description]
 * @method {isString, isFunction, isArray, indexOf, forEach, map, filter, now, type}
 * @return {[type]}
 */
(function ( util ) {
	var AP = Array.prototype,
		class2type = {};
	util.isString = function (obj) {
		return util.type( obj ) === '[object String]';
	};
	util.isFunction = function (obj) {
		return util.type( obj ) === '[object Function]';
	};
	util.isArray = function (obj) {
		return util.type( obj ) === '[object Array]';
	};
	util.indexOf = AP.indexOf ? function (arr, item) {
		return arr.indexOf(item);
	} : function (arr, item) {
		for (var i = 0, len = arr.length; i < len; i++) {
			if(arr[i] === item){
				return i;
			}
		}
		return -1;
	};
	var forEach = util.forEach = AP.forEach ? function (arr, fn) {
		arr.forEach(fn);
	} : function (arr, fn) {
		for (var i = 0, len = arr.length; i < len; i++) {
			fn(arr[i], i, arr);
		}
	};
	util.map = AP.map ? function (arr, fn) {
		return arr.map(fn);
	} : function (arr, fn) {
		var ret = [];
		forEach(arr, function (item, i, arr){
			ret.push(fn(item, i, arr));
		});
		return ret;
	};
	util.filter = AP.filter ? function (arr, fn) {
		return arr.filter(fn);
	} : function (arr, fn) {
		var ret = [];
		forEach(arr, function (item, i, arr) {
			if (fn(item, i, arr)) {
				ret.push(item);
			}
		});
		return ret;
	};
	util.now = Date.now || function () {
		return new Date().getTime();
	};
	util.type = function (obj) {
		return obj === null ? String( obj ) : class2type.toString.call( obj ) ;
	};
})(gui._util);

/**
 * [ 定义错误方法 ]
 * @param  {[type]} util [description]
 * @param  {[type]} data [description]
 * @method {error}
 * @return {[type]}
 */
(function (util, data) {
	var config = data.config;
	util.error = function (o) {
		if (o.type === 'error') {
			throw 'Errr occurs! ' + dump(o);
		} else if (config.debug && typeof console !== 'undefined') {
			console[o.type](dump(o));
		}
	};
	function dump (o) {
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
})(gui._util, util._data);

/**
 * [ 封装了些操作url的方法 ]
 * @param  {[type]} argument [description]
 * @method {}
 * @return {[type]}
 */
(function (util, data, global) {
	var config = data.config;
	function dirname (path) {
		var s = path.match(/.*(?=\/.*$)/);
		return (s ? s[0] : '.') + '/';
	}
	function realpath (path) {
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
					}) 
				}
			}
		};
	}
	util.dirname = dirname;
})(guijs._util, guijs._data, this);
