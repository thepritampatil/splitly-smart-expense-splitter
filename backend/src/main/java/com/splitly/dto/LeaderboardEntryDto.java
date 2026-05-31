package com.splitly.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

@Value
@Builder
public class LeaderboardEntryDto {
    Long userId;
    String fullName;
    String avatar;
    BigDecimal score;
    Integer rank;
    String label;
}
