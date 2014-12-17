define(['mockService'], function(MockService) {

  describe("MockService", function () {

    var baseUrl = "http://localhost:1234";
    var mockService = new MockService('Consumer', 'Provider', 1234, './pacts');

    beforeEach(function () {
      mockService.clean();
    });

    describe("a successful match using argument lists", function () {

      var doHttpCall = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseUrl + "/thing", false);
        xhr.setRequestHeader("Content-Type", 'text/plain')
        xhr.send('body');
        return xhr;
      };

      it("returns the mocked response", function () {
        mockService
          .uponReceiving("a request for hello")
          .withRequest("post", "/thing", {'Content-Type': 'text/plain'}, 'body')
          .willRespondWith(201, { "Content-Type": "application/json" }, {reply: "Hello"});

        mockService.setup();
        var response = doHttpCall();

        expect(JSON.parse(response.responseText)).toEqual({reply: "Hello"});
        expect(response.status).toEqual(201);
        expect(response.getResponseHeader('Content-Type')).toEqual("application/json")
      });
    });

    describe("a successful match using hash arguments", function () {

      var doHttpCall = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseUrl + "/thing", false);
        xhr.setRequestHeader("Content-Type", 'text/plain')
        xhr.send('body');
        return xhr;
      };

      it("returns the mocked response", function () {
        mockService
          .uponReceiving("another request for hello")
          .withRequest({
            method: "post",
            path: "/thing",
            headers: {'Content-Type': 'text/plain'},
            body:'body'
          })
          .willRespondWith({
            status: 201,
            headers: { "Content-Type": "application/json" },
            body: {
              reply: "Hello"
          }
        });

        mockService.setup();
        var response = doHttpCall();

        expect(JSON.parse(response.responseText)).toEqual({reply: "Hello"});
        expect(response.status).toEqual(201);
        expect(response.getResponseHeader('Content-Type')).toEqual("application/json")
      });
    });

    describe("multiple interactions mocked at the same time", function () {

      var doHttpCall = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", baseUrl + "/thing", false);
        xhr.send('body');
        return xhr;
      };

      var doDifferentHttpCall = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", baseUrl + "/different-thing", false);
        xhr.send('body');
        return xhr;
      };

      it("returns the correct mocked response", function () {
        mockService
          .uponReceiving("a request for a thing")
          .withRequest("get", "/thing")
          .willRespondWith(200, {}, 'thing response');

        mockService
          .uponReceiving("a different request for a thing")
          .withRequest("get", "/different-thing")
          .willRespondWith(200, {}, 'different thing response');

        mockService.setup();
        var response = doHttpCall();
        var differentResponse = doDifferentHttpCall();

        expect(response.responseText).toEqual('thing response');
        expect(differentResponse.responseText).toEqual('different thing response');
      });
    });

    describe("verifying a successful match", function () {

      var doHttpCall = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseUrl + "/thing", false);
        xhr.send();
        return xhr;
      };

      it("does not raise an error", function () {
        mockService
          .uponReceiving("a response that will be verified")
          .withRequest("post", "/thing")
          .willRespondWith(201);

        mockService.setup();
        var response = doHttpCall();

        expect(response.status).toEqual(201);
        mockService.verify();
      });
    });

    describe("verifying an unsuccessful match", function () {

      var doHttpCall = function() {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", baseUrl + "/wrongThing", false);
        xhr.send();
        return xhr;
      };

      var verify = function () { mockService.verify(); };

      it("raises an error", function () {

        mockService
          .uponReceiving("a response that will be verified")
          .withRequest("post", "/thing")
          .willRespondWith(201);

        mockService.setup();
        var response = doHttpCall();
        expect(response.status).toEqual(500);

        var errorRaised = false;
        try {
          verify();
        } catch(e) {
          errorRaised = true;
          expect(e.toString()).toMatch(/verification failed/);
        }
        expect(errorRaised).toBe(true);
      });
    });


  });

});