package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseParticipantDto {
    public Long userId;
    public String fullName;
    public String email;
    public BigDecimal shareAmount;
    public BigDecimal sharePercentage;
}
