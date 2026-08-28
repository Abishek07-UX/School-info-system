package com.schoolsystem.backend.common.dto.response;

import java.time.LocalDateTime;

public class ErrorResponse {

    private boolean success = false;
    private ApiError error;
    private LocalDateTime timestamp;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(ApiError error) {
        this.success = false;
        this.error = error;
        this.timestamp = LocalDateTime.now();
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

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
