package com.splitly.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotBlank(message = "Email is required")
    @Email
    public String email;

    @NotBlank(message = "Password is required")
    public String password;
}
