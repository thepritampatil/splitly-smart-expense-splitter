package com.splitly.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InitiatePaymentRequest {
    @NotNull(message = "Receiver ID is required")
    public Long receiverId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01")
    public BigDecimal amount;

    @NotNull(message = "Group ID is required")
    public Long groupId;
}
