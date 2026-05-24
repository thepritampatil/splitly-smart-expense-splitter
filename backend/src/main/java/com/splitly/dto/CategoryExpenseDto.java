package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryExpenseDto {
    public String category;
    public BigDecimal amount;
    public String color;
}
