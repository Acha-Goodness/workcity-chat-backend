class AppError extends Error {
    constructor(message, statusCode, res){
        super(message)
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith(4) ? "Fail" : "Error"
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);

        res.status(this.statusCode).json({
            status: this.status,
            message: this.message
        })
    }
}
module.exports = AppError;