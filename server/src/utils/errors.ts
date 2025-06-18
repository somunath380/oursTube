export class RefreshTokenValidationError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 401){
        super(message)
        this.statusCode = statusCode
        Object.setPrototypeOf(this, RefreshTokenValidationError.prototype)
    }
}

export class RefreshTokenNotExistError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 401){
        super(message)
        this.statusCode = statusCode
        Object.setPrototypeOf(this, RefreshTokenNotExistError.prototype)
    }
}
