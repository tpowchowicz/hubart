'use strict';

let PASSWORD = 'messagestopmessagestop';
let KEY = [7, 6, 5, 4, 3, 2, 1, 0];

let ENC = '';

for (let i = 0; i < PASSWORD.length; ++i) {
  let value = (PASSWORD[i].charCodeAt()
      - 'a'.charCodeAt() + KEY[i % KEY.length]) % 26 + 'a'.charCodeAt();
  ENC += String.fromCharCode(value);
}

console.log(ENC);
