/**
 * 
 * gui
 * 
 * practise
 * 
 */

this.gui = function () {
	_gui = this.gui;
};
gui.version = '1.0.0';
gui._util = {};
gui._fn = {};
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
		};
		return -1;
	};
	var forEach = util.forEach = AP.forEach ? function (arr, fn) {
		arr.forEach(fn);
	} : function (arr, fn) {
		for (var i = 0, len = arr.length; i < len; i++) {
			fn(arr[i], i, arr);
		};
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
			};
		});
		return ret;
	}
	util.type = function (obj) {
		return obj === null ? String( obj ) : class2type.toString.call( obj ) ;
	};
})(gui._util);
var strings = ['hello','world'];
var makeUpperCase = function (obj) {
	return obj.toUpperCase();
}
var uppers = gui._util.map(strings, makeUpperCase);
console. 