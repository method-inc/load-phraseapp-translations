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

/*
  Defaults

*/
var default_options = {
  file_format: "node_json",
  file_extension: "js",
  location: __dirname + "/locales",
  locales: ["en"] // Pulls down all locales if unspecified
};

module.exports = {
  initialize: function(options) {
    var options = configure(options);
    this.download(options);
  },

  configure: function(options) {
    return _.merge(default_options, options);
  },

  download: function(options) {
    var locales = this.fetchLocales(options, 
      function (err, l) {
        if (!err) {
          return l;
        }
      });

    _.each(locales, function(l, options) {
      this.downloadTranslationFiles(l, options);
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

  downloadTranslationFiles: function(locale, options) {
    var translationPath = path + '/projects/' + options.project_id + '/locales/' + locale + 'translations/download?access_token=' + options.access_token + '&file_format=' + options.file_format;
    request(translationPath, function(err, res, body) {
      if (!err && response.statusCode == 200) {

      } else if (err) {
        console.log(err);
      }
    }).pipe(fs.createWriteStream(options.location + "/" + options.locale + options.file_extension));
  }
}