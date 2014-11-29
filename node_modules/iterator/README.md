
JavaScript Iterator Tools
=========================

For the purpose of this document, an iterable is any value accepted by
the ``Iterator`` constructor.

An iterator is an object with a ``next()`` method, or optionally a
``send(n)`` method that conforms to the iterator protocol.

The iterator protocol is for the ``next`` or ``send`` methods to
return the next value in an iteration each time they are called, or to
throw the ``StopIteration`` object or a ``ReturnValue(value)`` object.

All methods of an iterator are generic and can be applied on other
iterables.  Functions that return iterables use the constructor
property in an attempt to respect the chainability of inheritors.

### Iterator(iterator)

Coerces an iteration (an object that has a ``step`` or ``next`` method
conforming to the iterator protocol) into an iterator object.

### Iterator(next)

Creates an iterator from a ``next`` function.  The ``next`` function
is obliged to either return the next value or throw a
``StopIteration``.

### Iterator([1, 2, 3])

Creates an iteration over each value in an array.

### Iterator("abc")

Creates an iteration over each character in a string.

### Generator(generator)

Decorates a generator function (a function that, when called, returns
an iterator) such that the returned iterator supports all of the
iterator interface described here.

## Iterator Constructor Properties

### Iterator.range(length)

Creates an iteration of a given length, starting at zero. 

### Iterator.range(start, stop, step=1)

Creates an iteration for a range of numbers from ``start``, in
``step`` increments, up to but not including ``stop``.

### Iterator.count(start, step=1)

Creates an iteration of indefinite length from the given starting
number in ``step`` wide increments.

### Iterator.cycle(iterable, times=Infinity)

Creates an iterator that will cycle over the values in a given
iterable a given number of times.  The iterable must be finite.

### Iterator.repeat(value, times=Infinity)

Constructs an iterator that repeats a given value some number of
times.

### Iterator.chain(...iterables)

Constructs an iterator that iterates over the values of each iterable
given as a variadic argument in order, starting the next when the
previous stops.

### Iterator.concat(iterables)

Constructs an iterator that iterates over the values of each iterable
given as the values of an iterable, starting the next when the
previous stops.

### Iterator.zip(...iterables)

Constructs an iterable that lazily produces an array for the
respective values of each iterable given as a variadic argument.

### Iterator.transpose(iterables)

Constructs an iterable that lazily produces an array for the
respective values of each given iterable from the given iterable.
This is analogous to a matrix transposition.

## Iterator Methods

### iterator.toArray()

Collects every value from the generator and produces an array.

### iterator.map(fun(value, index, iterator), this)

Returns an iterator that lazily consumes this iterator, translating
each value with the given function.  ``this`` is passed as ``this``
in the context of ``fun``.  ``index`` is the iteration number starting
with 0.

### iterator.forEach(fun(value, index, iterator), this)

Calls ``fun`` with each value from this iteration, passing ``this``
as ``this``, ``index`` as the iteration number starting at 0, and
``iterator``.  If the iteration stops with a
``ReturnValue``, ``forEach`` returns the final return value of this
iterator.

### iterator.reduce(fun(previous, value, i, iterator), initial, this)

Performs a reduction, consuming every value in this iteration from
left to right.  Equivalent to reducing an array of the same values.

### iterator.every(fun(value, i, iterator), this)

Returns whether all of the values in this iteration pass the given
test, consuming each value until one fails.

### iterator.some(fun(value, i, iterator), this)

Returns whether any of the values in this iteration pass the given
test, consuming each value until one passes.

### iterator.any(fun(value, i, iterator), this)

Returns whether any of the values in this iteration are truthy,
consuming all values until the first false value.

### iterator.all(fun(value, i, iterator), this)

Returns whether all of the values in this iteration are truthy,
consuming all values until the first true value.

### iterator.concat(...iterables)

Returns an iteration that first consumes and produces every value from
this iteration, then each subsequent iterable from the given variadic
arguments.

### iterator.dropWhile(fun(value, i, iterator), this)

Returns an iteration of each value that begins with the first value
that fails the given test.

### iterator.takeWhile(fun(value, i, iterator), this)

Returns an iteration that produces each value from this iteration up
to but not including the first value of this iteration that does not
pass the given test.

### iterator.filter(fun(value, i, iterator), this)

Returns an iteration that lazily consumes each value of this array and
produces each value that passes the given test.

### iterator.zip(...iterables)

Returns an iteration of arrays, where the first value of each array
comes from this iterator, and each subsequent value is the value at
the same index of each of the iterables given as variadic arguments.

### iterator.enumerate(start)

Produces a lazy iteration of each each ``[index, value]`` pair for
every value in this iteration.

### iterator.enumerate(start, indexKey, valueKey)

Produces a lazy iteration of each each ``{indexKey, valueKey}`` pair
(as an object with properties named by the given ``indexKey`` and
``valueKey``) for every value in this iteration.

Copyright 2011 Kristopher Michael Kowal
MIT License (enclosed)

