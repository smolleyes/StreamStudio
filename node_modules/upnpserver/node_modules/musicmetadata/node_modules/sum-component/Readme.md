
# sum

  Sum utility

## Installation

    $ component install component/sum

## API

### sum(array, [fn|string])

  Sum an array of numbers:

```js
sum([1,2,3,4,5]);
```

  Sum properties with callback:

```js
var sum = sum(users, function(user){
  return user.age;
});
```

### map(array, string)

  Sum properties in `string`:

```js
sum(users, 'age');
sum(repos, 'stats.watchers');
```

# License

  MIT
