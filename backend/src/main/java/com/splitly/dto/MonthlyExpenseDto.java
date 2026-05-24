package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthlyExpenseDto {
    public String month;
    public BigDecimal amount;
}
