package com.splitly.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InviteMemberRequest {
    @NotBlank(message = "Email is required")
    @Email
    public String email;
}
