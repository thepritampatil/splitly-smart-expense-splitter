package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.model.SplitType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class PercentageSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.PERCENTAGE;
    }

    @Override
    public List<ComputedShare> compute(BigDecimal totalAmount, List<ParticipantDto> participants) {
        int count = participants.size();
        List<ComputedShare> shares = new ArrayList<>(count);
        BigDecimal allocated = BigDecimal.ZERO;

        for (int i = 0; i < count; i++) {
            ParticipantDto p = participants.get(i);
            BigDecimal pct = p.sharePercentage != null ? p.sharePercentage : BigDecimal.ZERO;
            BigDecimal share;

            if (i < count - 1) {
                share = totalAmount.multiply(pct).divide(BigDecimal.valueOf(100), 2, RoundingMode.DOWN);
                allocated = allocated.add(share);
            } else {
                share = totalAmount.subtract(allocated);
            }

            shares.add(ComputedShare.builder()
                    .userId(p.userId)
                    .shareAmount(share)
                    .sharePercentage(pct)
                    .build());
        }
        return shares;
    }
}
