package com.splitly.gamification.badge;

import com.splitly.gamification.event.GamificationEvent;
import com.splitly.model.UserStats;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class BadgeContext {
    GamificationEvent event;
    UserStats stats;
    long expensesCreated;
    long foodExpensesPaid;
    long tripExpensesPaid;
    long groupActivityCount;
}
