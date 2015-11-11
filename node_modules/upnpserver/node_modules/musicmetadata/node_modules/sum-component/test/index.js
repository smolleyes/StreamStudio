
var sum = require('..');

var tobi = { name: { first: 'tobi' }, age: 2, role: { name: 'admin' } };
var loki = { name: { first: 'loki' }, age: 1 };
var jane = { name: { first: 'jane' }, age: 8 };

describe('sum(arr)', function(){
  it('should sum values', function(){
    sum([1,2,3]).should.equal(6);
  })

  it('should support property strings', function(){
    var users = [tobi, loki, jane];
    sum(users, 'age').should.equal(11);
  })

  it('should support nested property strings', function(){
    var arr = [{ foo: { bar: 5 }}, { foo: { bar: 5 }}];
    sum(arr, 'foo.bar').should.equal(10);
  })

  it('should support callbacks', function(){
    var users = [tobi, loki, jane];
    sum(users, function(user){
      return user.age;
    }).should.equal(11);
  })
})

describe('sum(obj, fn)', function(){
  it('should sum values', function(){
    sum({
      foo: 1,
      bar: 2,
      baz: 3
    }, function(val){
      return val;
    }).should.equal(6);
  })
})