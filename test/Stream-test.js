require('buster').spec.expose();
var expect = require('buster').expect;

var Stream = require('../Stream');
var sentinel = { value: 'sentinel' };

describe('Stream', function() {
	describe('each', function() {
		it('should call emitter', function() {
			var spy = this.spy();

			new Stream(spy).each(noop, noop);
			expect(spy).toHaveBeenCalled();

			function noop() {}
		});
	});

	describe('of', function() {
		it('should create a stream of one item', function() {
			var s = Stream.of(sentinel);
			var spy = this.spy();
			s.each(spy);

			expect(spy).toHaveBeenCalledOnceWith(sentinel);
			expect(spy).not.toHaveBeenCalledTwice();
		});
	});

	describe('end', function() {
		it('should prevent more events', function() {
			var s = Stream.of(sentinel);

			var spyNext = this.spy();
			var spyEnd = this.spy();
			s.end();
			s.each(spyNext, spyEnd);

			expect(spyNext).not.toHaveBeenCalled();
			expect(spyEnd).toHaveBeenCalledOnce();
		});
	});
	
	describe('catch', function() {
		it('should catch errors', function() {
			var s1 = Stream.of({}).map(function() {
				throw sentinel;
			});

			var s2 = s1.catch(function(x) {
				return x;
			});

			s2.each(function(x) {
				expect(x).toBe(sentinel);
			});
		})
	});

	describe('map', function() {
		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.map(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should be lazy', function() {
			var s = Stream.of();
			var spy = this.spy();

			s = s.map(spy);
			expect(spy).not.toHaveBeenCalled();

			s.each(function() {
				expect(spy).toHaveBeenCalled();
			});
		});

		it('should transform stream items', function() {
			var expected = {};
			var s = Stream.of(sentinel).map(function(x) {
				expect(x).toBe(sentinel);
				return expected;
			});

			s.each(function(x) {
				expect(x).toBe(expected);
			});
		});
	});

	describe('flatMap', function() {
		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.flatMap(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should be lazy', function() {
			var s = Stream.of();
			var spy = this.spy();

			s = s.flatMap(spy);
			expect(spy).not.toHaveBeenCalled();

			s.each(function() {
				expect(spy).toHaveBeenCalled();
			});
		});

		it('should transform stream items', function() {
			var a = {};
			var b = {};
			function f() {
				return Stream.of(a);
			}

			function g() {
				return Stream.of(b);
			}

			var s1 = Stream.of(sentinel).flatMap(f).flatMap(g);
			var s2 = Stream.of(sentinel).flatMap(function(x) {
				return f(x).flatMap(g);
			});

			s1.each(function(result1) {
				s2.each(function(result2) {
					expect(result1).toBe(result2);
				});
			});
		});
	});

	describe('flatten', function() {
		it('should flatten stream of stream of x to stream of x', function() {
			var s = Stream.of(Stream.of(sentinel)).flatten();
			s.each(function(x) {
				expect(x).toBe(sentinel);
			});
		});
	});

	describe('filter', function() {
		it('should return a stream containing only allowed items', function() {
			var s = new Stream(function(next) {
				[sentinel, {}].forEach(next);
			}).filter(function(x) {
				return x === sentinel;
			});

			s.each(function(x) {
				expect(x).toBe(sentinel);
			});
		})
	})

	describe('tap', function() {
		it('should return a new stream', function() {
			var s1 = Stream.of();
			var s2 = s1.tap(function(){});

			expect(s2).not.toBe(s1);
			expect(s2 instanceof s1.constructor).toBeTrue();
		});

		it('should be lazy', function() {
			var s = Stream.of();
			var spy = this.spy();

			s = s.tap(spy);
			expect(spy).not.toHaveBeenCalled();

			s.each(function() {
				expect(spy).toHaveBeenCalled();
			});
		});

		it('should not transform stream items', function() {
			var expected = {};
			var s = Stream.of(sentinel).tap(function(x) {
				expect(x).toBe(sentinel);
				return expected;
			});

			s.each(function(x) {
				expect(x).toBe(sentinel);
			});
		});
	});

});