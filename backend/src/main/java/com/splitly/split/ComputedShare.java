package com.splitly.split;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComputedShare {
    private Long userId;
    private BigDecimal shareAmount;
    private BigDecimal sharePercentage;
}
