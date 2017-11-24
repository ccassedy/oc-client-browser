'use strict';

describe('oc-client : getData', function() {
  var execute = function(options, cb) {
    return oc.getData(options, cb);
  };

  describe('when not providing the mandatory parameters', function() {
    describe('when asking for data without baseUrl', function() {
      var throwingFunction = function() {
        return execute({ name: 'someName', version: '0.0.1' });
      };

      it('should throw an error', function() {
        expect(throwingFunction).toThrow('baseUrl parameter is required');
      });
    });

    describe('when asking for data without name', function() {
      var throwingFunction = function() {
        return execute({
          baseUrl: 'http://www.opencomponents.com',
          version: '0.0.1'
        });
      };

      it('should throw an error', function() {
        expect(throwingFunction).toThrow('name parameter is required');
      });
    });

    describe('when asking for data without version', function() {
      var throwingFunction = function() {
        return execute({
          baseUrl: 'http://www.opencomponents.com',
          name: 'a-component'
        });
      };

      it('should throw an error', function() {
        expect(throwingFunction).toThrow('version parameter is required');
      });
    });
  });

  describe('when providing the mandatory parameters', function() {
    describe('when requesting data', function() {
      it('should call the $.ajax method correctly', function(done) {
        var spy = sinon.spy(oc.$, 'ajax');

        execute(
          {
            baseUrl: 'http://www.components.com/v2',
            name: 'myComponent',
            version: '6.6.6',
            parameters: {
              name: 'evil'
            }
          },
          function() {
            expect(spy.args[0][0].method).toEqual('POST');
            expect(spy.args[0][0].url).toEqual('http://www.components.com/v2');
            expect(spy.args[0][0].data.components[0].name).toEqual(
              'myComponent'
            );
            expect(spy.args[0][0].data.components[0].version).toEqual('6.6.6');
            expect(spy.args[0][0].data.components[0].parameters.name).toEqual(
              'evil'
            );
            expect(spy.args[0][0].headers.Accept).toEqual(
              'application/vnd.oc.unrendered+json'
            );
            done();
          }
        );
      });

      it('should call the callback correctly', function(done) {
        var originalAjax = oc.$.ajax;
        oc.$.ajax = function(options) {
          return options.success({ renderMode: 'unrendered', data: 'hello' });
        };

        execute(
          {
            baseUrl: 'http://www.components.com/v2',
            name: 'myComponent',
            version: '6.6.6',
            parameters: {
              name: 'evil'
            }
          },
          function(err, data) {
            expect(err).toEqual(null);
            expect(data).toEqual('hello');
            done();
          }
        );
      });

      it('should call the callback with an error if the registry reponde with a rendered component', function(
        done
      ) {
        var originalAjax = oc.$.ajax;
        oc.$.ajax = function(options) {
          return options.success({ renderMode: 'rendered', data: 'hello' });
        };

        execute(
          {
            baseUrl: 'http://www.components.com/v2',
            name: 'myComponent',
            version: '6.6.6',
            parameters: {
              name: 'evil'
            }
          },
          function(err, data) {
            expect(err).toEqual('Error getting data');
            expect(data).toEqual(undefined);
            done();
          }
        );
      });
    });
  });
});
