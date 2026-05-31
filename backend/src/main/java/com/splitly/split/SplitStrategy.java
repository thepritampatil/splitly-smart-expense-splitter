package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.model.SplitType;

import java.math.BigDecimal;
import java.util.List;

public interface SplitStrategy {
    SplitType getType();

    List<ComputedShare> compute(BigDecimal totalAmount, List<ParticipantDto> participants);
}
