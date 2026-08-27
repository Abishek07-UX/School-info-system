package com.schoolsystem.backend.dto.response;

public class ErrorResponse {

    private boolean success = false;
    private ApiError error;

    public ErrorResponse() {
    }

    public ErrorResponse(ApiError error) {
        this.success = false;
        this.error = error;
    }

    public static ErrorResponse of(String code, String message) {
        return new ErrorResponse(new ApiError(code, message));
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public ApiError getError() {
        return error;
    }

    public void setError(ApiError error) {
        this.error = error;
    }
}
