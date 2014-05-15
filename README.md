# gulp-substituter [![Build Status][travis-image]][travis-url]

[travis-url]: ttps://travis-ci.org/madebysource/gulp-substituter
[travis-image]: https://secure.travis-ci.org/madebysource/gulp-substituter.png?branch=master

> Replace matched strings in files for defined values

## Install

```bash
$ npm install --save-dev gulp-substituter
```

## Gulp Usage

### gulpfile.js

```js
var sprites = require('gulp-substituter');

gulp.task('replace', function() {
  return gulp.src('index.html')
    .pipe(substituter({
      title: 'website'
    }))
    .pipe(gulp.dest('dist'))
});
```

### index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><!-- replace:title --></title>
</head>
<body>
</body>
</html>
```

## API

### substituter(options)

#### Options

Object of keys that you want to replace

##### Predefined keys

###### __start

Type: `String`
Default: `<!--`

Start tag for matching values

###### __end

Type: `String`
Default: `-->`

End tag for matching values

###### __prefix

Type: `String`
Default: `replace`

prefix before key

#### Example

```js
{
  title: 'website',
  description: 'sample website',
  analytics: 'example-123'
}
```

## License

[MIT license](http://opensource.org/licenses/mit-license.php)

