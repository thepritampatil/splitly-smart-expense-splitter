package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BalanceDto {
    public Long userId;
    public String fullName;
    public String email;
    public BigDecimal totalPaid;
    public BigDecimal totalOwed;
    public BigDecimal netBalance;
}
