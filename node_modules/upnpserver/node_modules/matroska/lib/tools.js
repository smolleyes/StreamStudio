/*jslint node: true, vars: true, nomen: true */
'use strict';

var util = require('util');
var debug = require('debug')('matroska:tools');

var Schema = require('./schema');
var dateformat = require('dateformat');

var CLASS_A_SIZE = Math.pow(2, 7);
var CLASS_B_SIZE = Math.pow(2, 14);
var CLASS_C_SIZE = Math.pow(2, 21);
var CLASS_D_SIZE = Math.pow(2, 28);
var CLASS_E_SIZE = Math.pow(2, 35);
var CLASS_F_SIZE = Math.pow(2, 42);
var CLASS_G_SIZE = Math.pow(2, 49);
var CLASS_H_SIZE = Math.pow(2, 56);

var MAX_7BITS = Math.pow(2, 7);
var MAX_8BITS = Math.pow(2, 8);
var MAX_15BITS = Math.pow(2, 15);
var MAX_16BITS = Math.pow(2, 16);
var MAX_23BITS = Math.pow(2, 23);
var MAX_24BITS = Math.pow(2, 24);
var MAX_31BITS = Math.pow(2, 31);
var MAX_32BITS = Math.pow(2, 32);
var MAX_39BITS = Math.pow(2, 39);
var MAX_40BITS = Math.pow(2, 40);
var MAX_47BITS = Math.pow(2, 47);
var MAX_48BITS = Math.pow(2, 48);
var MAX_52BITS = Math.pow(2, 52);
var MAX_53BITS = Math.pow(2, 53);
var MAX_55BITS = Math.pow(2, 55);
var MAX_56BITS = Math.pow(2, 56);

var BITSn = [ 0,
	256,
	Math.pow(2, 16),
	Math.pow(2, 24),
	Math.pow(2, 32),
	Math.pow(2, 40),
	Math.pow(2, 48),
	Math.pow(2, 56) ];

var BUFFS = [ new Buffer([ 0 ]), new Buffer([ 1 ]), new Buffer([ 2 ]), new Buffer([ 3 ]) ];
var BUFFSV = [ new Buffer([ 0x80 ]), new Buffer([ 0x81 ]) ];

var floatBuf = new Buffer(4);

var tools = {
	readVInt: function(buffer, start, ret, keepMask) {
		start = start || 0;

		var bs = buffer[start];
		if (!bs) {
			var error = new Error("INVALID VINT format (value=0)");
			error.code = 'INVALID';
			throw error;
		}

		var length = 8;

		if (bs >= 0x80) {
			length = 1;
		} else if (bs >= 0x40) {
			length = 2;
		} else if (bs >= 0x20) {
			length = 3;
		} else if (bs >= 0x10) {
			length = 4;
		} else if (bs >= 0x08) {
			length = 5;
		} else if (bs >= 0x04) {
			length = 6;
		} else if (bs >= 0x02) {
			length = 7;

		} else if (bs >= 0x01) {
			length = 8;

		} else {
			var error = new Error("INVALID VINT format (length>7 bs=" + bs + ")");
			error.code = 'INVALID';
			throw error;
		}

		if (start + length > buffer.length) {
			if (debug.enabled) {
				debug("No enough bytes for VINT format " + start + "+" + length + ">" + buffer.length);
			}
			return null;
		}

		if (!ret) {
			ret = {};
		}

		ret.length = length;

		var value = bs;
		if (!keepMask) {
			value &= ((1 << (8 - length)) - 1);
		}
		length--;
		start++;

		for (; length;) {
			var len = Math.min(length, 6);

			var v = buffer.readUIntBE(start, len);
			value = value * BITSn[len] + v;

			if (length === 7) {
				if (value >= MAX_40BITS) {
					var error = new Error("INVALID VINT value too big (length>7 bs=" + bs + ")");
					error.code = 'INVALID';
					throw error;
				}
			}

			length -= len;
			start += len;
		}
		ret.value = value;
		return ret;
	},

	writeVInt: function(value, buffer, offset) {
		if (value < 0) {
			throw new Error("Unrepresentable value: " + value);
		}

		if (value < BUFFSV.length) {
			return BUFFSV[value];
		}

		var length = this.sizeVInt(value);

		if (!buffer) {
			buffer = new Buffer(length);
			offset = 0;
		}

		this.writeVIntBuffer(value, buffer, offset);

		if (offset === 0 && buffer.length === length) {
			return buffer;
		}

		return buffer.slice(offset, length);
	},

	writeVIntBuffer: function(value, buffer, offset) {
		if (value < 0) {
			throw new Error("Unrepresentable value: " + value);
		}

		if (offset < 0 || isNaN(offset)) {
			throw new Error("Invalid offset " + offset);
		}

		var length = this.sizeVInt(value);
		// console.log("sizeVInt(" + value.toString(16) + ")=>" + length);

		if (length > 1) {
			var l = length - 1;
			var off = offset + l + 1;
			for (; l;) {
				var len = Math.min(l, 6);

				off -= len;
				buffer.writeUIntBE(value, off, len, true);
				value /= BITSn[len];
				l -= len;

				// console.log("WriteBlock rest=" + value.toString(16) + " len=" + len +
				// " l=" + l + " off=" + off);
			}
		}

		buffer[offset] = value | (1 << (8 - length));

		return length;
	},

	readHInt: function(buffer, start, ret) {
		return this.readVInt(buffer, start, ret, true);
	},

	sizeHInt: function(value) {

		if (value < 0) {
			throw new Error("Unrepresentable value: " + value);
		}

		return this.sizeVInt(value / 2);
	},

	sizeVInt: function(value) {

		if (value < 0) {
			throw new Error("Unrepresentable value: " + value);
		}

		if (value < CLASS_A_SIZE - 1) {
			return 1;
		}

		if (value < CLASS_B_SIZE - 1) {
			return 2;
		}

		if (value < CLASS_C_SIZE - 1) {
			return 3;
		}

		if (value < CLASS_D_SIZE - 1) {
			return 4;
		}

		if (value < CLASS_E_SIZE - 1) {
			return 5;
		}

		if (value < CLASS_F_SIZE - 1) {
			return 6;
		}

		if (value < CLASS_G_SIZE - 1) {
			return 7;
		}

		return 8;
	},

	sizeUInt: function(value) {

		if (value < 0) {
			throw new Error("Unrepresentable value: " + value);
		}

		if (value < MAX_8BITS) {
			return 1;
		}

		if (value < MAX_16BITS) {
			return 2;
		}

		if (value < MAX_24BITS) {
			return 3;
		}

		if (value < MAX_32BITS) {
			return 4;
		}

		if (value < MAX_40BITS) {
			return 5;
		}

		if (value < MAX_48BITS) {
			return 6;
		}

		if (value < MAX_56BITS) {
			return 7;
		}

		return 8;
	},

	sizeInt: function(value) {

		if (value > -MAX_7BITS && value < MAX_7BITS) {
			return 1;
		}

		if (value > -MAX_15BITS && value < MAX_15BITS) {
			return 2;
		}

		if (value > -MAX_23BITS && value < MAX_23BITS) {
			return 3;
		}

		if (value > -MAX_31BITS && value < MAX_31BITS) {
			return 4;
		}

		if (value > -MAX_39BITS && value < MAX_39BITS) {
			return 5;
		}

		if (value > -MAX_47BITS && value < MAX_47BITS) {
			return 6;
		}

		if (value > -MAX_55BITS && value < MAX_55BITS) {
			return 7;
		}

		return 8;
	},

	sizeFloat: function(value) {
		floatBuf.writeFloatBE(value, 0);

		var n2 = floatBuf.readFloatBE(0);
		if (n2 !== value) {
			return 8;
		}

		return 4;
	},

	writeInt: function(newValue) {
		var size = this.sizeInt(newValue);
		var b;
		if (size === 1) {
			if (newValue >= 0 && newValue < BUFFS.length) {
				return BUFFS[newValue];
			}

			b = new Buffer(1);
			b[0] = newValue;
			return b;
		}

		if (size < 7) {
			b = new Buffer(size);
			b.writeIntBE(0, newValue, b.length);
			return b;
		}

		if (newValue > -MAX_53BITS && newValue < MAX_53BITS) {
			b = new Buffer(7);
			b[0] = newValue / MAX_48BITS;
			b.writeUIntBE(newValue, 1, 6, true);
			return b;
		}

		throw new Error("Can not encode more than 52 bits");
	},

	writeUInt: function(newValue) {

		var size = this.sizeUInt(newValue);
		var b;

		if (size === 1) {
			if (newValue < BUFFS.length) {
				return BUFFS[newValue];
			}

			b = new Buffer(1);
			b[0] = newValue;
			return b;
		}

		if (size < 7) {
			try {
				b = new Buffer(size);
				b.writeUIntBE(newValue, 0, b.length);
			} catch (x) {
				throw new Error("newValue=" + newValue + " len=" + b.length + " " + x);
			}
			return b;
		}

		if (newValue < MAX_53BITS) {
			b = new Buffer(7);
			b[0] = newValue / MAX_48BITS;
			b.writeUIntBE(newValue, 1, 6, true);
			return b;
		}

		throw new Error("Can not encode more than 52 bits");
	},

	convertEbmlID: function(ebmlID) {
		if (typeof (ebmlID) === "number") {
			return ebmlID;
		}
		if (typeof (ebmlID) === "string") {
			var desc = Schema.byName[ebmlID];
			if (!desc) {
				throw new Error("Unknown ebmlID name '" + emblID + "'");
			}

			return desc;
		}

		throw new Error("Invalid ebmlID parameter '" + ebmlID + "'");
	},

	writeCRC: function(crc) {
		var data = new Buffer(4);

		for (var i = 0; i < 4; i++) {
			data[i] = crc;
			crc >>= 8;
		}

		return data;
	},

	writeEbmlID: function(ebmlID) {
		var data = new Buffer(8);

		for (var i = data.length - 1; i >= 0; i--) {
			data[i] = ebmlID;
			ebmlID >>= 8;

			if (!ebmlID) {
				return data.slice(i);
			}
		}

		return data;
	},

	readCRC: function(data) {
		var len = data.length;
		var crc = 0;

		for (var i = 0; i < len; i++) {
			crc = crc << 8 + data[i];
		}

		return crc;
	},

	formatDate: function(date) {
		return dateformat(date, "yyyy-mm-dd HH:MM:ss.l");
	},

	formatDay: function(date) {
		return dateformat(date, "yyyy-mm-dd");
	},

	formatYear: function(date) {
		return dateformat(date, "yyyy");
	},

	validType: function(type, value) {
		switch (type) {
		case "8":
		case "s":
			if (typeof (value) === "string" || value === null || value === undefined) {
				return value;
			}
			break;

		case "u":
		case "i":
			if (typeof (value) === "number" || value === undefined) {
				return value;
			}
			break;

		case "u":
		case "i":
		case "f":
			if (typeof (value) === "number" || value === undefined) {
				return value;
			}
			break;

		case "d":
			if (util.isDate(value) || value === null || value === undefined) {
				return value;
			}

			break;

		case "b":
			if (Buffer.isBuffer(value) || value === null || value === undefined) {
				return value;
			}
			break;
		}

		throw new Error("Invalid value '" + value + "' for type '" + type + "'");
	}
};

module.exports = tools;
