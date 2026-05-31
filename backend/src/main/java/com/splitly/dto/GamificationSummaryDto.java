package com.splitly.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class GamificationSummaryDto {
    UserStatsDto stats;
    List<BadgeDto> recentBadges;
}
