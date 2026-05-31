package com.splitly.gamification;

import com.splitly.model.UserStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StreakTrackingService {

    private final UserStatsService userStatsService;

    public void recordSettlementActivity(Long userId, LocalDate settlementDate) {
        UserStats stats = userStatsService.getOrCreate(userId);
        LocalDate last = stats.getLastSettlementDate();

        if (last == null) {
            stats.setStreakCount(1);
        } else if (last.equals(settlementDate)) {
            // same day — no streak change
        } else if (last.plusDays(1).equals(settlementDate)) {
            stats.setStreakCount(stats.getStreakCount() + 1);
        } else {
            stats.setStreakCount(1);
        }

        stats.setLastSettlementDate(settlementDate);
        if (stats.getStreakCount() > stats.getLongestStreak()) {
            stats.setLongestStreak(stats.getStreakCount());
        }
    }
}
