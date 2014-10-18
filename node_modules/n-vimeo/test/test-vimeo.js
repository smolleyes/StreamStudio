var assert = require('assert')
  , api = require('../')
  , vimeo = api.vimeo
  ;

describe('Vimeo API', function(){
  describe('Global Options via vimeo.vimeo', function(){
    it('should return an error', function(done){
      vimeo('user', 'numbusLLC','videos', function(error){
        if (error) {
          assert.equal(error && true,true)
          done()
        }
      });
    });
    it('should return the api info and 200 status', function(done){
      vimeo('user','brad','videos',function(err,data){
        if (err) throw err;
        assert.equal(data.statusCode, 200);
        assert.equal(data.body.hasOwnProperty('length'), true);
        done();
      });
    })
    it('should return the albums from the user', function(done){
      api.user('brad','albums',function(err,resp){
        if (err) throw err;
        assert.equal(resp.statusCode,200);
        assert.equal(resp.body.hasOwnProperty('length'), true);
        resp.body.forEach(function(album){
          if (album){
            assert(album.id);
            assert(album.created_on);
            assert(album.total_videos);
            assert(album.title)
          }
        });
        done();
      })
    })
  })
  describe('Global Options via vimeo.video', function(){
    it('Should use Api.video endpoint with 404',function(done){
      api.video('33544767', function(err,res){
        if (err) throw err;
        assert.equal(res.statusCode,404);
        assert.equal(res.body,'33544767 not found.')
        done()
      })
    });
    it('Should use Api.video endpoint succesfully',function(done){
      api.video('42605731', function(err,res){
        if (err && err.message != 'parsing error') throw err;
        if (err.message == 'parsing error')
          assert(err);
        else if (!err){
          assert.equal(res.statusCode,200);
          assert.equal(res.body.hasOwnProperty('length'),true);
        }
        done()
      })
    })
  })
})