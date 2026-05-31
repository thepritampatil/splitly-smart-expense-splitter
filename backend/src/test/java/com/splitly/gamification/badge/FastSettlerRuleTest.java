package com.splitly.gamification.badge;

import com.splitly.gamification.badge.rules.FastSettlerRule;
import com.splitly.model.UserStats;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class FastSettlerRuleTest {

    private final FastSettlerRule rule = new FastSettlerRule();

    @Test
    void eligible_whenThreeOnTimeSettlements() {
        UserStats stats = UserStats.builder()
                .trustScore(BigDecimal.valueOf(50))
                .onTimeSettlements(3)
                .build();
        BadgeContext ctx = BadgeContext.builder()
                .stats(stats)
                .expensesCreated(0)
                .foodExpensesPaid(0)
                .tripExpensesPaid(0)
                .groupActivityCount(0)
                .build();
        assertTrue(rule.isEligible(ctx));
    }

    @Test
    void notEligible_belowThreshold() {
        UserStats stats = UserStats.builder().onTimeSettlements(2).build();
        BadgeContext ctx = BadgeContext.builder()
                .stats(stats)
                .expensesCreated(0)
                .foodExpensesPaid(0)
                .tripExpensesPaid(0)
                .groupActivityCount(0)
                .build();
        assertFalse(rule.isEligible(ctx));
    }
}
