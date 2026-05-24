package com.splitly.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateMessageRequest {
    @NotBlank(message = "Content is required")
    @Size(max = 1000)
    public String content;

    @NotNull(message = "Group ID is required")
    public Long groupId;
}
