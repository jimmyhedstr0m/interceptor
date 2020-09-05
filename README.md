# interceptor
Intercept JavaScript ```XMLHttpRequest``` in systems where you need a callback on certain HTTP requests.

## Install
```console
$ npm install --save @jimmyhedstr0m/interceptor
```
or
```console
$ yarn add @jimmyhedstr0m/interceptor
```

## Usage
```javascript
const Interceptor = require('@jimmyhedstr0m/interceptor');

const options = {
  timeout: 30000
};

Interceptor.register('https://randomuser.me/api/', options, (err, res) => {
  if (err) {
    console.log('got error', err);
  }

  console.log('success', res);
  Interceptor.unregister();
});

const xhttp = new XMLHttpRequest();
xhttp.open("GET", "https://randomuser.me/api/");
xhttp.send();
```

You can also pattern match any url by using RegExp:
```javascript
Interceptor.register(/\/api\//, options, (err, res) => { }
```