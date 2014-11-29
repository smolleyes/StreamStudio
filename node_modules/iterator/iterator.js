
var global = (function () {return this})();

// upgrades an iterator to a Iterator
function Iterator(iterator) {

    if (Array.isArray(iterator) || typeof iterator == "string")
        return Iterator.iterate(iterator);

    iterator = Object(iterator);

    if (!(this instanceof Iterator))
        return new Iterator(iterator);

    this.next = this.send =
        iterator.send || iterator.next || iterator;

    if (
        Object.prototype.toString.call(this.next) !=
        "[object Function]"
    )
        throw new TypeError();

}

Iterator.prototype.toArray = function () {
    var self = Iterator(this),
        i = 0,
        values = [];

    if (Array.isArray(this))
        return this;

    try {
        while (true) {
            values[i] = self.next();
            i++;
        }
    } catch (exception) {
        if (isStopIteration(exception)) {
            return values;
        } else {
            throw exception;
        }
    }
};

Iterator.prototype.map = function (fun /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        return fun.call(thisp, self.next(), i++, self);
    });
};

Iterator.prototype.forEach = function (fun /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0,
        value;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    try {
        while (true) {
            value = self.next();
            fun.call(thisp, value, i, self);
            i++;
        }
    } catch (exception) {
        if (isStopIteration(exception)) {
            return exception.value;
        } else {
            throw exception;
        }
    }
};

Iterator.prototype.reduce = function (fun /*, initial, thisp*/) {
    var self = Iterator(this),
        result = arguments[1],
        thisp = arguments[2],
        i = 0,
        value;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    // first iteration unrolled
    try {
        value = self.next();
        if (arguments.length > 1) {
            result = fun.call(thisp, result, value, i, self);
        } else {
            result = value;
        }
        i++;
    } catch (exception) {
        if (isStopIteration(exception)) {
            if (arguments.length > 1) {
                return arguments[1]; // initial
            } else {
                throw TypeError("cannot reduce a value from an empty iterator with no initial value");
            }
        } else {
            throw exception;
        }
    }

    // remaining entries
    try {
        while (true) {
            value = self.next();
            result = fun.call(thisp, result, value, i, self);
            i++;
        }
    } catch (exception) {
        if (isStopIteration(exception)) {
            return result;
        } else {
            throw exception;
        }
    }

};

Iterator.prototype.every = function (fun /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        result = true;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    self.map.apply(self, arguments)
    .forEach(function (value) {
        if (!value) {
            result = false;
            throw StopIteration;
        }
    });

    return result;
};

Iterator.prototype.some = function (fun /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        result = false;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    self.map.apply(self, arguments)
    .forEach(function (value) {
        if (value) {
            result = true;
            throw StopIteration;
        }
    });

    return result;
};

Iterator.prototype.all = function () {
    return Iterator(this).every(function (value) {
        return value;
    });
};

Iterator.prototype.any = function () {
    return Iterator(this).some(function (value) {
        return value;
    });
};

Iterator.prototype.concat = function () {
    return Iterator.concat(
        Array.prototype.concat.apply(this, arguments)
    );
};

Iterator.prototype.dropWhile = function (fun /*, thisp */) {
    var self = Iterator(this),
        thisp = arguments[1],
        stopped = false,
        stopValue;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    self.forEach(function (value, i) {
        if (!fun.call(thisp, value, i, self)) {
            stopped = true;
            stopValue = value;
            throw StopIteration;
        }
    });

    if (stopped) {
        return self.constructor([stopValue]).concat(self);
    } else {
        return self.constructor([]);
    }
};

Iterator.prototype.takeWhile = function (fun /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1];

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    return self.map(function (value, i) {
        if (!fun.call(thisp, value, i, self))
            throw StopIteration;
        return value;
    });
};

Iterator.prototype.filter = function (fun /*, thisp*/) {
    var self = Iterator(this),
        thisp = arguments[1],
        i = 0;

    if (Object.prototype.toString.call(fun) != "[object Function]")
        throw new TypeError();

    return new self.constructor(function () {
        var value;
        while (true) {
            value = self.next();
            if (fun.call(thisp, value, i++, self))
                return value;
        }
    });
};

Iterator.prototype.zip = function () {
    return Iterator.transpose(
        Array.prototype.concat.apply(this, arguments)
    );
};

Iterator.prototype.enumerate = function (start, key, value) {
    var enumeration = Iterator.count(start).zip(this);
    if (arguments.length > 1) {
        enumeration = enumeration.map(function (pair) {
            pair[key] = pair[0];
            pair[value] = pair[1];
            return pair;
        });
    }
    return enumeration;
};

// coerces arrays to iterators
// iterators to self
Iterator.iterate = function (array) {
    var start;
    array = Object(array);
    if (array.next)
        return array;
    start = 0;
    return new Iterator(function () {
        // advance to next owned entry
        while (!(start in array)) {
            // deliberately late bound
            if (start >= array.length)
                throw StopIteration;
            start += 1;
        }
        var result = array[start];
        start += 1;
        return result;
    });
};

Iterator.cycle = function (cycle, times) {
    if (arguments.length < 2)
        times = Infinity;
    //cycle = Iterator(cycle).toArray();
    var next = function () {
        throw StopIteration;
    };
    return new Iterator(function () {
        var iteration;
        try {
            return next();
        } catch (exception) {
            if (isStopIteration(exception)) {
                if (times <= 0)
                    throw exception;
                times--;
                iteration = Iterator.iterate(cycle);
                next = iteration.next.bind(iteration);
                return next();
            } else {
                throw exception;
            }
        }
    });
};

Iterator.concat = function (iterators) {
    iterators = Iterator(iterators);
    var next = function () {
        throw StopIteration;
    };
    return new Iterator(function (){
        var iteration;
        try {
            return next();
        } catch (exception) {
            if (isStopIteration(exception)) {
                iteration = iterators.next();
                next = iteration.next.bind(iteration);
                return next();
            } else {
                throw exception;
            }
        }
    });
};

Iterator.transpose = function (iterators) {
    iterators = Iterator(iterators).map(Iterator).toArray();
    if (iterators.length < 1)
        return new Iterator([]);
    return new Iterator(function () {
        var stopped;
        var result = iterators.map(function (iterator) {
            try {
                return iterator.next();
            } catch (exception) {
                if (isStopIteration(exception)) {
                    stopped = true;
                } else {
                    throw exception;
                }
            }
        });
        if (stopped) {
            throw StopIteration;
        }
        return result;
    });
};

Iterator.zip = function () {
    return Iterator.transpose(
        Array.prototype.slice.call(arguments)
    );
};

Iterator.chain = function () {
    return Iterator.concat(
        Array.prototype.slice.call(arguments)
    );
};

Iterator.range = function (start, stop, step) {
    if (arguments.length < 3)
        step = 1;
    if (arguments.length < 2) {
        stop = start;
        start = 0;
    }
    start = start || 0;
    return new Iterator(function () {
        if (start >= stop)
            throw StopIteration;
        if (isNaN(start))
            throw '';
        var result = start;
        start += step;
        return result;
    });
};

Iterator.count = function (start, step) {
    step = step || 1;
    return Iterator.range(start, Infinity, step);
};

Iterator.repeat = function (value, times) {
    if (arguments.length < 2)
        times = Infinity;
    times = +times;
    return new Iterator.range(times).map(function () {
        return value;
    });
};

// shim isStopIteration
if (typeof isStopIteration == "undefined") {
    global.isStopIteration = function (exception) {
        return Object.prototype.toString.call(exception)
            === "[object StopIteration]";
    };
}

// shim StopIteration
if (typeof StopIteration == "undefined") {
    global.StopIteration = {};
    Object.prototype.toString = (function (toString) {
        return function () {
            if (
                this === global.StopIteration ||
                this instanceof global.ReturnValue
            )
                return "[object StopIteration]";
            else
                return toString.call(this, arguments);
        };
    })(Object.prototype.toString);
}

// shim ReturnValue
if (typeof ReturnValue == "undefined") {
    global.ReturnValue = function (value) {
        if (!(this instanceof global.ReturnValue))
            return new global.ReturnValue(value);
        this.value = value;
    };
}

function Generator(generator) {
    return function () {
        return new Iterator(generator.apply(this, arguments));
    };
}

if (typeof exports !== "undefined") {
    exports.Iterator = Iterator;
    exports.Generator = Generator;
}

