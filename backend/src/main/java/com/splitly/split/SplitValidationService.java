package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.exception.BadRequestException;
import com.splitly.model.SplitType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SplitValidationService {

    private static final BigDecimal TOLERANCE = new BigDecimal("0.01");

    public void validate(SplitType splitType, BigDecimal totalAmount, List<ParticipantDto> participants) {
        if (participants == null || participants.isEmpty()) {
            throw new BadRequestException("At least one participant is required");
        }

        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Expense amount must be greater than zero");
        }

        Set<Long> seen = new HashSet<>();
        for (ParticipantDto p : participants) {
            if (p.userId == null) {
                throw new BadRequestException("Each participant must have a userId");
            }
            if (!seen.add(p.userId)) {
                throw new BadRequestException("Duplicate participants are not allowed");
            }
        }

        switch (splitType) {
            case EXACT -> validateExact(totalAmount, participants);
            case PERCENTAGE -> validatePercentage(participants);
            case EQUAL -> { /* no extra input validation */ }
        }
    }

    private void validateExact(BigDecimal totalAmount, List<ParticipantDto> participants) {
        BigDecimal total = BigDecimal.ZERO;
        for (ParticipantDto p : participants) {
            if (p.shareAmount == null || p.shareAmount.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Exact split amounts must be zero or positive");
            }
            total = total.add(p.shareAmount);
        }
        if (total.subtract(totalAmount).abs().compareTo(TOLERANCE) > 0) {
            throw new BadRequestException(
                    "Exact split amounts (" + total + ") must equal total expense (" + totalAmount + ")"
            );
        }
    }

    private void validatePercentage(List<ParticipantDto> participants) {
        BigDecimal totalPct = BigDecimal.ZERO;
        for (ParticipantDto p : participants) {
            if (p.sharePercentage == null || p.sharePercentage.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Percentages must be zero or positive");
            }
            totalPct = totalPct.add(p.sharePercentage);
        }
        if (totalPct.subtract(BigDecimal.valueOf(100)).abs().compareTo(TOLERANCE) > 0) {
            throw new BadRequestException(
                    "Percentages must add up to 100% (current total: " + totalPct.stripTrailingZeros().toPlainString() + "%)"
            );
        }
    }
}
