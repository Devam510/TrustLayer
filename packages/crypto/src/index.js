"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentVersion = exports.loadKey = exports.maybeReencrypt = exports.getEncryptedVersion = exports.decrypt = exports.encrypt = void 0;
// @trustlayer/crypto public API
var aes_1 = require("./aes");
Object.defineProperty(exports, "encrypt", { enumerable: true, get: function () { return aes_1.encrypt; } });
Object.defineProperty(exports, "decrypt", { enumerable: true, get: function () { return aes_1.decrypt; } });
Object.defineProperty(exports, "getEncryptedVersion", { enumerable: true, get: function () { return aes_1.getEncryptedVersion; } });
Object.defineProperty(exports, "maybeReencrypt", { enumerable: true, get: function () { return aes_1.maybeReencrypt; } });
var keys_1 = require("./keys");
Object.defineProperty(exports, "loadKey", { enumerable: true, get: function () { return keys_1.loadKey; } });
Object.defineProperty(exports, "getCurrentVersion", { enumerable: true, get: function () { return keys_1.getCurrentVersion; } });
//# sourceMappingURL=index.js.map