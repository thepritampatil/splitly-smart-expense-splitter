package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.model.SplitType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Component
public class ExactSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.EXACT;
    }

    @Override
    public List<ComputedShare> compute(BigDecimal totalAmount, List<ParticipantDto> participants) {
        return participants.stream()
                .map(p -> {
                    BigDecimal share = p.shareAmount != null ? p.shareAmount : BigDecimal.ZERO;
                    BigDecimal pct = totalAmount.compareTo(BigDecimal.ZERO) > 0
                            ? share.multiply(BigDecimal.valueOf(100)).divide(totalAmount, 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;
                    return ComputedShare.builder()
                            .userId(p.userId)
                            .shareAmount(share)
                            .sharePercentage(pct)
                            .build();
                })
                .toList();
    }
}
