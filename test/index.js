var should = require("chai").should(),
    fs = require("fs"),
    nock = require("nock"),
    request = require("request"),
    _ = require('lodash'),
    loadTranslations = require("../index"),
    initialize = loadTranslations.initialize,
    download = loadTranslations.download,
    fetchLocales = loadTranslations.fetchLocales,
    downloadTranslationFile = loadTranslations.downloadTranslationFile,
    configure = loadTranslations.configure;

var http = require("http");

describe("#configure", function() {
  var config;

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
      "file_name_base",
      "location",
      "transform"
    );
  });

  it("overrides file location", function() {
    config.should.have.property('location', 'test');
  })

  it("default transform does nothing", function() {
    var output = {
      "test": "file"
    };
    config.transform(output).should.equal(output);
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
      .query({ access_token: 1 })
      .reply(200, [
        {
            "id": "1",
            "name": "de(name)",
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
            "name": "en(name)",
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

  afterEach(function() {
    api.isDone();
  });

  it("has two locales", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.have.length(2);
      done();
    });
  });

  it("is an array", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      res.should.be.an("array");
      done();
    });
  });

  it("contains German and English", function(done) {
    fetchLocales(config, function(err, res) {
      if (err) return done(err);
      var resLocales = _.pluck(res, "code");
      resLocales.should.have.members(["de", "en"]);
      done();
    });
  });
});

describe("#downloadTranslationFiles", function() {
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
      .persist()
      .get("/v2/projects/1/locales/en/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hi, %s",
        "navigation.search": "Search",
        "navigation.shopping_cart": "Shopping Cart",
        "navigation.sign_in": "Sign In",
        "navigation.wishlist": "Wishlist"
      });
  });

  it("downloads the translation file", function(done) {
    downloadTranslationFile({id:'en', code:'en'}, config, function(err, res) {
      if (err) return done(err);
      fs.exists(res, function(res) {
        done();
      });
    });
  });

  it("has the correct contents in the translation file", function(done) {
    var fileContents, apiFileContents, fileName;

    request("https://api.phraseapp.com/v2/projects/1/locales/en/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode = 200 && !err) {
          apiFileContents = body;
        }
      });

    downloadTranslationFile({id:'en', code:'en'}, config, function(err, res) {
      if (err) return done(err);
      fileName = res;
      fileContents = fs.readFileSync(fileName).toString();
      fileContents.should.equal(apiFileContents);
      done();
    });
  });

  afterEach(function() {
    fs.unlink(config.location + "/en.js");
    api.isDone();
  });
});

describe("#download", function() {
  var config, api;

  before(function() {
    var options = {
      access_token: 1,
      project_id: 1
    };

    config = configure(options);

    api = nock("https://api.phraseapp.com")
      .persist()
      .get("/v2/projects/1/locales/2/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hi, %s",
        "navigation.search": "Search",
        "navigation.shopping_cart": "Shopping Cart",
        "navigation.sign_in": "Sign In",
        "navigation.wishlist": "Wishlist"
      })
      .get("/v2/projects/1/locales/1/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hallo, %s",
        "navigation.search": "Suchen",
        "navigation.shopping_cart": "Einkaufswagen",
        "navigation.sign_in": "Anmeldung",
        "navigation.wishlist": "Wunschzettel"
      })
      .get("/v2/projects/1/locales")
      .query({ access_token: 1 })
      .reply(200, [
        {
            "id": "1",
            "name": "de_1",
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
            "name": "en(name)",
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

  after(function() {
    api.isDone();
    fs.unlink(config.location + "/en.js");
    fs.unlink(config.location + "/de.js");
  });

  it("downloads all of the files", function(done) {
    download(config, function(err, res) {
      if (err) return done(err);

      fs.existsSync(config.location + "/en.js");
      fs.existsSync(config.location + "/de.js");
    });

    done();
  });

  it("has the correct contents in the downloaded files", function(done) {
    var apiFileContents = {};
    var fileContents = {};

    request("https://api.phraseapp.com/v2/projects/1/locales/2/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode = 200 && !err) {
          apiFileContents['en'] = body;
        }
      });

    request("https://api.phraseapp.com/v2/projects/1/locales/1/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode = 200 && !err) {
          apiFileContents['de'] = body;
        }
      });

      download(config, function(err, res) {
        if (err) return done(err);

          fileContents['en'] = fs.readFileSync(config.location + "/en.js").toString();
          fileContents['de'] = fs.readFileSync(config.location + "/de.js").toString();

          fileContents.should.deep.equal(apiFileContents);
      });

      done();
  });

  it("transforms the data correctly", function(done) {
    var apiFileContents = {};
    var fileContents = {};
    var new_config = _.extend({}, config, {
      transform: function(data) {
        data.test_key = 'hello';
        return data;
      }
    });

    download(new_config, function(err, res) {
      if (err) return done(err);

      fileContents['en'] = fs.readFileSync(config.location + "/en.js").toString();

      JSON.parse(fileContents['en']).should.contain.key('test_key');
    });
    done();
  });
});

describe("#download using filename options", function() {
    var config, api;

    before(function() {
        var options = {
            access_token: 1,
            project_id: 1,
            tag: "t",
            file_name_base:"<name>_<tag>"
        };

        config = configure(options);

        api = nock("https://api.phraseapp.com")
            .persist()
            .get("/v2/projects/1/locales/2/download")
            .query({ access_token: 1, file_format: "node_json", tag: "t" })
            .reply(200, {
                "greeting": "Hi, %s",
                "navigation.search": "Search",
                "navigation.shopping_cart": "Shopping Cart",
                "navigation.sign_in": "Sign In",
                "navigation.wishlist": "Wishlist"
            })
            .get("/v2/projects/1/locales/1/download")
            .query({ access_token: 1, file_format: "node_json", tag: "t" })
            .reply(200, {
                "greeting": "Hallo, %s",
                "navigation.search": "Suchen",
                "navigation.shopping_cart": "Einkaufswagen",
                "navigation.sign_in": "Anmeldung",
                "navigation.wishlist": "Wunschzettel"
            })
            .get("/v2/projects/1/locales")
            .query({ access_token: 1 })
            .reply(200, [
                {
                    "id": "1",
                    "name": "de_1",
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
                    "name": "en_2",
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

    after(function() {
        api.isDone();
        api.cleanAll();
        fs.unlink(config.location + "/en_2_t.js");
        fs.unlink(config.location + "/de_1_t.js");
    });

    it("downloads all of the files", function(done) {
        download(config, function(err, res) {
            if (err) return done(err);

            fs.existsSync(config.location + "/en_2_t.js");
            fs.existsSync(config.location + "/de_1_t.js");
        });

        done();
    });

    it("has the correct contents in the downloaded files", function(done) {
        var apiFileContents = {};
        var fileContents = {};

        request("https://api.phraseapp.com/v2/projects/1/locales/2/download?access_token=1&file_format=node_json&tag=t",
            function(err, res, body) {
                if (res.statusCode = 200 && !err) {
                    apiFileContents['en'] = body;
                }
            });

        request("https://api.phraseapp.com/v2/projects/1/locales/1/download?access_token=1&file_format=node_json&tag=t",
            function(err, res, body) {
                if (res.statusCode = 200 && !err) {
                    apiFileContents['de'] = body;
                }
            });

        download(config, function(err, res) {
            if (err) return done(err);

            fileContents['en'] = fs.readFileSync(config.location + "/en_2_t.js").toString();
            fileContents['de'] = fs.readFileSync(config.location + "/de_1_t.js").toString();

            fileContents.should.deep.equal(apiFileContents);
        });

        done();
    });

    it("transforms the data correctly", function(done) {
        var apiFileContents = {};
        var fileContents = {};
        var new_config = _.extend({}, config, {
            transform: function(data) {
                data.test_key = 'hello';
                return data;
            }
        });

        download(new_config, function(err, res) {
            if (err) return done(err);

            fileContents['en'] = fs.readFileSync(config.location + "/en_2_t.js").toString();

            JSON.parse(fileContents['en']).should.contain.key('test_key');
        });
        done();
    });
});

describe("#initialize", function() {
  var api, options;

  before(function() {
    options = {
      access_token: 1,
      project_id: 1,
      location: process.cwd()
    };

    api = nock("https://api.phraseapp.com")
      .persist()
      .get("/v2/projects/1/locales/2/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hi, %s",
        "navigation.search": "Search",
        "navigation.shopping_cart": "Shopping Cart",
        "navigation.sign_in": "Sign In",
        "navigation.wishlist": "Wishlist"
      })
      .get("/v2/projects/1/locales/1/download")
      .query({ access_token: 1, file_format: "node_json" })
      .reply(200, {
        "greeting": "Hallo, %s",
        "navigation.search": "Suchen",
        "navigation.shopping_cart": "Einkaufswagen",
        "navigation.sign_in": "Anmeldung",
        "navigation.wishlist": "Wunschzettel"
      })
      .get("/v2/projects/1/locales")
      .query({ access_token: 1 })
      .reply(200, [
        {
            "id": "1",
            "name": "de_1",
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
            "name": "en_2",
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

  after(function() {
    api.isDone();
    fs.unlink(options.location + "/en.js");
    fs.unlink(options.location + "/de.js");
  });

  it("downloads all of the files", function(done) {
    initialize(options, function(err, res) {
      if (err) return done(err);

      fs.existsSync(options.location + "/en.js");
      fs.existsSync(options.location + "/de.js");
    });

    done();
  });

  it("has the correct contents in the downloaded files", function(done) {
    var apiFileContents = {};
    var fileContents = {};

    request("https://api.phraseapp.com/v2/projects/1/locales/2/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode = 200 && !err) {
          apiFileContents['en'] = body;
        }
      });

    request("https://api.phraseapp.com/v2/projects/1/locales/1/download?access_token=1&file_format=node_json",
      function(err, res, body) {
        if (res.statusCode = 200 && !err) {
          apiFileContents['de'] = body;
        }
      });

      initialize(options, function(err, res) {
        if (err) return done(err);

        fileContents['en'] = fs.readFileSync(options.location + "/en.js").toString();
        fileContents['de'] = fs.readFileSync(options.location + "/de.js").toString();

        fileContents.should.deep.equal(apiFileContents);
      });

      done();
  });
});