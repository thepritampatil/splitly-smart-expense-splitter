package com.splitly.dto;

import com.splitly.model.UserStats;
import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDate;

@Value
@Builder
public class UserStatsDto {
    BigDecimal trustScore;
    Integer streakCount;
    Integer longestStreak;
    LocalDate lastSettlementDate;
    Integer totalSettlements;
    BigDecimal settlementSuccessRate;
    BigDecimal contributionScore;

    public static UserStatsDto from(UserStats stats) {
        return UserStatsDto.builder()
                .trustScore(stats.getTrustScore())
                .streakCount(stats.getStreakCount())
                .longestStreak(stats.getLongestStreak())
                .lastSettlementDate(stats.getLastSettlementDate())
                .totalSettlements(stats.getTotalSettlements())
                .settlementSuccessRate(stats.getSettlementSuccessRate())
                .contributionScore(stats.getContributionScore())
                .build();
    }
}
