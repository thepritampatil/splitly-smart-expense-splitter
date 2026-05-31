package com.splitly.gamification;

import com.splitly.model.UserStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TrustScoreService {

    private final UserStatsService userStatsService;

    public void recordSettlementCompleted(Long userId, boolean onTime) {
        UserStats stats = userStatsService.getOrCreate(userId);
        stats.setTotalSettlements(stats.getTotalSettlements() + 1);
        if (onTime) {
            stats.setOnTimeSettlements(stats.getOnTimeSettlements() + 1);
        }
        updateSuccessRate(stats);
        recalculateTrust(stats);
    }

    public void recordContribution(Long userId, BigDecimal delta) {
        UserStats stats = userStatsService.getOrCreate(userId);
        stats.setContributionScore(stats.getContributionScore().add(delta));
        recalculateTrust(stats);
    }

    private void updateSuccessRate(UserStats stats) {
        if (stats.getTotalSettlements() == 0) {
            stats.setSettlementSuccessRate(BigDecimal.ZERO);
            return;
        }
        double rate = stats.getOnTimeSettlements() * 100.0 / stats.getTotalSettlements();
        stats.setSettlementSuccessRate(BigDecimal.valueOf(rate).setScale(2, RoundingMode.HALF_UP));
    }

    private void recalculateTrust(UserStats stats) {
        double timeliness = stats.getTotalSettlements() > 0
                ? stats.getOnTimeSettlements() * 100.0 / stats.getTotalSettlements()
                : 50.0;
        double streakBonus = Math.min(stats.getStreakCount() * 2.0, 20.0);
        double contribBonus = Math.min(stats.getContributionScore().doubleValue() / 5.0, 15.0);
        double score = 40.0 + timeliness * 0.4 + streakBonus + contribBonus;
        score = Math.min(100.0, Math.max(0.0, score));
        stats.setTrustScore(BigDecimal.valueOf(score).setScale(2, RoundingMode.HALF_UP));
        stats.setLastCalculatedAt(LocalDateTime.now());
    }
}
