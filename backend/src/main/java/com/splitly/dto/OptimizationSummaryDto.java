package com.splitly.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OptimizationSummaryDto {
    public List<DebtDto> transactions;
    public int optimizedTransactionCount;
    public int naiveTransactionCount;
    public double reductionPercent;
    public boolean allSettled;
}
