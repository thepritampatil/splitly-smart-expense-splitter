package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.model.SplitType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Component
public class EqualSplitStrategy implements SplitStrategy {

    @Override
    public SplitType getType() {
        return SplitType.EQUAL;
    }

    @Override
    public List<ComputedShare> compute(BigDecimal totalAmount, List<ParticipantDto> participants) {
        int count = participants.size();
        List<ComputedShare> shares = new ArrayList<>(count);
        BigDecimal perHead = totalAmount.divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN);
        BigDecimal allocated = BigDecimal.ZERO;

        for (int i = 0; i < count; i++) {
            BigDecimal share;
            if (i < count - 1) {
                share = perHead;
                allocated = allocated.add(share);
            } else {
                share = totalAmount.subtract(allocated);
            }
            BigDecimal pct = totalAmount.compareTo(BigDecimal.ZERO) > 0
                    ? share.multiply(BigDecimal.valueOf(100)).divide(totalAmount, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            shares.add(ComputedShare.builder()
                    .userId(participants.get(i).userId)
                    .shareAmount(share)
                    .sharePercentage(pct)
                    .build());
        }
        return shares;
    }
}
