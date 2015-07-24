var should = require("chai").should(),
    fs = require("fs"),
    nock = require("nock"),
    loadTranslations = require("../index"),
    initialize = loadTranslations.initialize,
    download = loadTranslations.download,
    fetchLocales = loadTranslations.fetchLocales,
    downloadFiles = loadTranslations.downloadFiles,
    configure = loadTranslations.configure;

var http = require("http");

// Mock JSON responses from API

  // .get("/v2/projects/1/locales/en/translations/download")
  // .query(true)
  // .reply(200, {
  //   "greeting": "Hi, %s",
  //   "navigation.search": "Search",
  //   "navigation.shopping_cart": "Shopping Cart",
  //   "navigation.sign_in": "Sign In",
  //   "navigation.wishlist": "Wishlist"
  // });

describe("#configure", function() {
  before(function() {
    var options = {
      access_token: 1,
      project_id: 1,
      location: 'test'
    };

    config = configure(options);
  });

  it("is an object", function() {
    config.should.be.an("object");
  });

  it("has the required keys", function() {
    config.should.have.all.keys(
      "access_token", 
      "project_id",
      "file_format",
      "file_extension",
      "location",
      "locales"
    );
  });

  it("overrides file location", function() {
    config.should.have.property('location', 'test');
  })
});

describe("#fetchLocales", function() {
  var config, api;

  before(function() {
    var options = {
      access_token: 1,
      project_id: 1
    };

    config = configure(options);
  });

  beforeEach(function() {
    api = nock("https://api.phraseapp.com")
      .get("/v2/projects/1/locales")
      .query(true)
      .reply(200, [
        {
            "id": "1",
            "name": "de",
            "code": "de",
            "default": false,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:56:07Z",
            "updated_at": "2015-07-13T15:56:07Z",
            "source_locale": null
        },
        {
            "id": "2",
            "name": "en",
            "code": "en",
            "default": true,
            "main": false,
            "rtl": false,
            "plural_forms": [
                "zero",
                "one",
                "other"
            ],
            "created_at": "2015-07-13T15:55:44Z",
            "updated_at": "2015-07-13T15:55:45Z",
            "source_locale": null
        }
      ]);
  });

  it("has two locales", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.have.length(2);
      done();
    });
    api.isDone();
  });

  it("is an array", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.be.an("array");
      done();
    })

    api.isDone();
  });

  it("contains German and English", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.have.members(["de", "en"]);
      done();
    });

    api.isDone();
  });
});