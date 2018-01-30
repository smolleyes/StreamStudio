'use strict';

let chai = require('chai'),
    expect = chai.expect,
    nock = require('nock');

describe('request', () => {
    let request;

    beforeEach(() => {
        request = require('../src/main.js');

        nock.cleanAll();
        nock.disableNetConnect();
    });

    afterEach(() => {
        nock.enableNetConnect();
    });

    describe('request(url)', () => {
        it('makes HTTP GET request', async () => {
            let nrequest = nock('http://gajus.com')
                .get('/')
                .reply(200, '');

            await request('http://gajus.com/');

            expect(nrequest.isDone()).to.equal(true);
        });

        it('response defines body', async () => {
            let nrequest,
                response;

            nrequest = nock('http://gajus.com')
                .get('/')
                .reply(200, 'foo');

            response = await request('http://gajus.com/');

            expect(response.body).to.equal('foo');
        });

        it('response defines statusCode', async () => {
            let nrequest,
                response;

            nrequest = nock('http://gajus.com')
                .get('/')
                .reply(204);

            response = await request('http://gajus.com/');

            expect(response.statusCode).to.equal(204);
        });

        it('response defines headers', async () => {
            let nrequest,
                response;

            nrequest = nock('http://gajus.com')
                .get('/')
                .reply(200, '', {
                    foo: 'bar'
                });

            response = await request('http://gajus.com/');

            expect(response.headers).to.deep.equal({foo: 'bar'});
        });
    });

    describe('request(url, {})', () => {
        describe('when option is unknown', function () {
            it('throws an error', async () => {
                try {
                    await request('http://gajus.com/', {foo: 'bar'});
                } catch (e) {
                    expect(e.message).to.equal('Unknown option ("foo").');
                }
            });
        });

        describe('request(url, {method})', () => {
            it('makes HTTP request using the specified HTTP method', async () => {
                let nrequest = nock('http://gajus.com')
                    .delete('/')
                    .reply(200);

                await request('http://gajus.com/', {method: 'DELETE'});

                expect(nrequest.isDone()).to.equal(true);
            });

            describe('when method is unknown', () => {
                it('throws an error', async () => {
                    try {
                        await request('http://gajus.com/', {method: 'foobar'});
                    } catch (e) {
                        expect(e.message).to.equal('Unknown option.method value ("foobar").');
                    }
                });
            });
        });

        describe('request(url, {data})', () => {
            it('makes HTTP request using the specified HTTP data', async () => {
                let nrequest = nock('http://gajus.com')
                    .post('/', {foo: 'bar'})
                    .reply(200);

                await request('http://gajus.com/', {method: 'POST', data: {foo: 'bar'}});

                expect(nrequest.isDone()).to.equal(true);
            });
        });

        describe('request(url, {headers})', () => {
            it('makes HTTP request using the specified HTTP headers', async () => {
                let nrequest = nock('http://gajus.com')
                    .matchHeader('foo', 'bar')
                    .get('/')
                    .reply(200);

                await request('http://gajus.com/', {headers: {foo: 'bar'}});

                expect(nrequest.isDone()).to.equal(true);
            });
        });

        describe('request(url, {cookieJar})', () => {
            it('establishes a cookieJar', async () => {
                nock('http://gajus.com')
                    .get('/set-cookie')
                    .reply(200, '', {
                        'set-cookie': 'foo=bar'
                    });

                nock('http://gajus.com')
                    .matchHeader('cookie', 'foo=bar')
                    .get('/use-cookie')
                    .reply(200);

                request = request.defaults({
                    cookieJar: true,
                    //proxy: 'http://127.0.0.1:8080/'
                });

                await request('http://gajus.com/set-cookie');
                await request('http://gajus.com/use-cookie');
            });
        });

        describe('request(url, {proxy})', () => {
            // nock does not allow testing proxy.
        });
    });

    describe('request.defauls()', () => {
        it('returns the current default options', () => {
            expect(request.defaults()).to.deep.equal({});

            request = request.defaults({headers: {foo: 'bar'}});

            expect(request.defaults()).to.deep.equal({headers: {foo: 'bar'}});
        });
    });

    describe('request.defauls({})', () => {
        it('returns a wrapper around the normal request API with predefined default options', async () => {
            let nrequest;

            request = request.defaults({headers: {foo: 'bar'}});

            nrequest = nock('http://gajus.com')
                .matchHeader('foo', 'bar')
                .get('/')
                .reply(200);

            await request('http://gajus.com/', {headers: {foo: 'bar'}});

            expect(nrequest.isDone()).to.equal(true);
        });
        it('does not affect the original instance', async () => {
            let nrequest;

            request.defaults({method: 'POST'});

            nrequest = nock('http://gajus.com')
                .get('/')
                .reply(200, '');

            await request('http://gajus.com/');

            expect(nrequest.isDone()).to.equal(true);
        });
        it('overwrites existing defaults', () => {
            request = request.defaults({headers: {foo: 'bar'}});

            expect(request.defaults()).to.deep.equal({headers: {foo: 'bar'}});

            request = request.defaults({method: 'POST'});

            expect(request.defaults()).to.deep.equal({method: 'POST'});
        });
    });
});
