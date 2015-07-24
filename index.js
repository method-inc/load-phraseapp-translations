/*
  Load in PhraseApp translations with v2 API.
  Must specify an API token, a locale, and a format.
  Default format returned is js for i18n-node-2.
*/

var request = require('request');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');

var path = 'https://api.phraseapp.com/v2';

module.exports = {
  initialize: function(options, callback) { 
    if (!options.access_token || !options.project_id || !options.location) {
      return console.error('Must supply a value for access_token and project_id');
    }

    if (!callback) { callback = function(err, res) { }; }

    var config = module.exports.configure(options);
    module.exports.download(config, function(err, res) {
      if (err) { return callback(err); }
      return callback(null, res);
    });
  },

  configure: function(options) {
    var default_options = {
      file_format: "node_json",
      file_extension: "js",
      location: __dirname
    };

    return _.merge(default_options, options);
  },

  download: function(options, callback) {
    module.exports.fetchLocales(options,
      function (err, locales) {
        if (!err) {
          _.each(locales, function(l) {
            module.exports.downloadTranslationFile(l, options, function(err, res) {
              if (!err) {
                console.log("Translation for " + l + " downloaded successfully.");
                return callback(null, l);
              } else {
                console.error("Error downloading " + l + ".", err);
                return callback(err);
              }
            });
          });
        }
      });
  },

  fetchLocales: function(options, callback) {
    var locales;

    request(path + '/projects/' + options.project_id + '/locales?access_token=' + options.access_token, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        locales = _.pluck(JSON.parse(body), "code");
        return callback(null, locales);
      } else if (err) {
        console.error("An error occurred when fetching locales", err);
        return callback(err);
      }
    });
  },

  downloadTranslationFile: function(locale, options, callback) {
    var translationPath = path + '/projects/' + options.project_id + '/locales/' + locale + '/translations/download?access_token=' + options.access_token + '&file_format=' + options.file_format;

    request(translationPath, function(err, res, body) {
      if (!err && res.statusCode == 200) {
        var fileName = options.location + "/" + locale + "." + options.file_extension;

        fs.writeFile(fileName, body, function(err) {
          if (err) {
            return console.error("An error occured when downloading translation file", err);
          }

          return callback(null, fileName);
        })
      } else if (err) {
        console.error("An error occured when downloading translation file", err);
        return callback(err);
      }
    });
  }
}