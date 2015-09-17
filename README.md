[![Build Status](https://travis-ci.org/Skookum/load-phraseapp-translations.svg?branch=master)](https://travis-ci.org/Skookum/load-phraseapp-translations)

# load-phraseapp-translations
npm module for pulling down translation files from [PhraseApp](http://phraseapp.com/) for a project using the [v2 API](http://docs.phraseapp.com/api/v2/). For use in build scripts.

## Installation
```
npm install load-phraseapp-translations --save
```

## Usage

```
var loadTranslations = require('load-phraseapp-translations');

loadTranslations.initialize({
  access_token: 1,
  project_id: 1,
  location: __dirname + '/locales'
});

> Translation for de downloaded successfully.
> Translation for en downloaded successfully.
```

### Arguments
#### Options (required)
 * *access_token*: Required. Your PhraseApp access token.
 * *project_id*: Required. The ID of the project you want to pull down translations for.
 * *location*: Optional, defaults to current directory. If supplied, must be an existing path.
 * *file_format*: Optional, defaults to `node_json`, the format for [i18n-node-2](https://github.com/jeresig/i18n-node-2).
 * *file_extension*: Optional, defaults to `js`.
 * *transform*: Optional function that should be called with each locale's data if additional processing is required before it is saved. Takes a string containing the data from Phrase and should return a string containing the new data. Defaults to a no-op.

#### Callback
Initialize also accepts an optional callback that returns an error and a success response.

```
var loadTranslations = require('load-phraseapp-translations');

loadTranslations.initialize({
  access_token: 1,
  project_id: 1,
  location: __dirname + '/locales'
}, function(err, res) {
    if (!err) {
    // Do something
    }
    // Do something else
});
```

## Tests
```
npm test
```

## Release History
* 0.1.1 Cleaned up unused dependencies; fixed erroneous API call.
* 0.1.0 Initial release