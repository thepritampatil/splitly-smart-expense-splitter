package com.splitly.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentRequest {
    @NotNull(message = "Settlement ID is required")
    public Long settlementId;
}
