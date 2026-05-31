package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SplitPreviewResponse {
    public boolean valid;
    public BigDecimal totalAmount;
    public BigDecimal allocatedAmount;
    public BigDecimal remainingAmount;
    public List<ExpenseParticipantDto> participants;
}
