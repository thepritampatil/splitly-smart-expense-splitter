package com.splitly.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Value
@Builder
public class GroupActivityPointDto {
    LocalDate day;
    Integer expenseCount;
    Integer settlementCount;
    Integer activeParticipants;
    BigDecimal activityScore;
}
