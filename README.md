# Interceptor
Intercept JavaScript ```XMLHttpRequest``` in systems where you need a callback on certain HTTP requests.

## Installation

### Using npm
```console
$ npm install --save @jimmyhedstr0m/interceptor
```
or
```console
$ yarn add @jimmyhedstr0m/interceptor
```

Now import `Interceptor` and start using it:

```js
import Interceptor from '@jimmyhedstr0m/interceptor';
```

### Without a bundler

Add this script to your HTML file:

```html
<script src="https://https://unpkg.com/@jimmyhedstr0m/interceptor/dist/index.js"></script>
```

## Usage
```javascript
const Interceptor = require('@jimmyhedstr0m/interceptor');

// optional
const options = {
  timeout: 30000
};

const interceptor = new Interceptor(options);

interceptor.register('https://randomuser.me/api/', (err, res) => {
  if (err) {
    console.log('got error', err);
  }

  console.log('success', res);
  interceptor.unregister();
});

const xhr = new XMLHttpRequest();
xhr.open('GET', 'https://randomuser.me/api/');
xhr.send();
```

You can also pattern match any url by using RegExp:
```javascript
Interceptor.register(/\/api\//, options, (err, res) => { }
```