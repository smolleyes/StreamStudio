/*jslint node: true, vars: true, nomen: true */
'use strict';

var schema = require('../schema');
var tools = require('../tools');

function addAttribute(proto, ebmlName) {
	var ebmlID = schema.byName[ebmlName];
	if (!ebmlID) {
		throw new Error("Invalid ebmlName '" + ebmlName + "'");
	}

	var schemaInfo = schema.byEbmlID[ebmlID];

	var type = schemaInfo.type;

	var name = ebmlName;
	var ret = /^([A-Z])([a-z].*)$/.exec(name);
	if (ret) {
		name = ret[1].toLowerCase() + ret[2];
	}

	Object.defineProperty(proto, name, {
		iterable: true,
		get: function() {
			var child = this.getFirstChildByName(ebmlID);
			if (child) {
				if (schemaInfo.type2 === "ebmlID") {
					return child.getUInt();
				}
				return child.getValue();
			}

			return undefined;
		},
		set: function(value) {

			var child = this.getFirstChildByName(ebmlID);
			if (!child) {
				child = this.ownerDocument.createElement(ebmlID);
				this.appendChild(child);
			}

			if (schemaInfo.type2 === "ebmlID") {
				child.setTargetEbmlID(value);

			} else if (schemaInfo.position) {
				child.setTargetPosition(value);

			} else {
				try {
					value = tools.validType(type, value);

				} catch (x) {
					console.error("Type of attribute=", schemaInfo, x);

					throw x;
				}

				child.setValue(value);
			}

			return this;
		}
	});

	Object.defineProperty(proto, "$$" + name, {
		iterable: false,
		get: function() {
			var child = this.getFirstChildByName(ebmlID);

			return child;
		}
	});
	proto["get" + ebmlName] = function() {
		var child = this.getFirstChildByName(ebmlID);
		if (child) {
			return child;
		}

		child = this.ownerDocument.createElement(ebmlID);
		this.appendChild(child);

		return child;
	};

}

function addChild(proto, ebmlName) {
	var ebmlID = schema.byName[ebmlName];
	if (!ebmlID) {
		throw new Error("Invalid ebmlName '" + ebmlName + "'");
	}

	var name = ebmlName;
	var ret = /^([A-Z])([a-z].*)$/.exec(name);
	if (ret) {
		name = ret[1].toLowerCase() + ret[2];
	}

	var names = name;
	var ret = /(.*)y$/.exec(names);
	if (ret) {
		names = ret[1] + "ies";
	} else {
		names = name + "s";
	}

	Object.defineProperty(proto, names, {
		iterable: true,
		get: function() {
			return this.listChildrenByName(ebmlID);
		}
	});

	Object.defineProperty(proto, name, {
		iterable: true,
		get: function() {
			var child = this.getFirstChildByName(ebmlID);

			return child;
		}
	});

	Object.defineProperty(proto, "$" + name, {
		iterable: true,
		get: function() {
			var child = this.getFirstChildByName(ebmlID);

			if (child) {
				return child;
			}

			child = this.ownerDocument.createElement(ebmlID);
			this.appendChild(child);

			return child;
		}
	});

	proto["new" + ebmlName] = function() {
		var child = this.ownerDocument.createElement(ebmlID);
		this.appendChild(child);

		return child;
	};
	proto["add" + ebmlName] = function(value) {
		var child = this.ownerDocument.createElement(ebmlID);
		this.appendChild(child);

		child.setValue(value);

		return child;
	};

}

function oneChild(proto, ebmlName) {
	var ebmlID = schema.byName[ebmlName];
	if (!ebmlID) {
		throw new Error("Invalid ebmlName '" + ebmlName + "'");
	}

	var name = ebmlName;
	var ret = /^([A-Z])([a-z].*)$/.exec(name);
	if (ret) {
		name = ret[1].toLowerCase() + ret[2];
	}

	Object.defineProperty(proto, name, {
		iterable: true,
		get: function() {
			var child = this.getFirstChildByName(ebmlID);

			return child;
		}
	});

	Object.defineProperty(proto, "$" + name, {
		iterable: true,
		get: function() {
			var child = this.getFirstChildByName(ebmlID);

			if (child) {
				return child;
			}

			child = this.ownerDocument.createElement(ebmlID);
			this.appendChild(child);

			return child;
		}
	});

	proto["set" + ebmlName] = function() {
		var old = this.getFirstChildByName(name);
		if (old) {
			old.remove();
		}

		var child = this.ownerDocument.createElement(ebmlID);
		this.appendChild(child);

		return child;
	};

}

module.exports = {
	addAttribute: addAttribute,
	addChild: addChild,
	oneChild: oneChild
};
