"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenNotExistError = exports.RefreshTokenValidationError = void 0;
class RefreshTokenValidationError extends Error {
    constructor(message, statusCode = 401) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, RefreshTokenValidationError.prototype);
    }
}
exports.RefreshTokenValidationError = RefreshTokenValidationError;
class RefreshTokenNotExistError extends Error {
    constructor(message, statusCode = 401) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, RefreshTokenNotExistError.prototype);
    }
}
exports.RefreshTokenNotExistError = RefreshTokenNotExistError;
//# sourceMappingURL=errors.js.map