package com.splitly.gamification.badge.rules;

import com.splitly.gamification.badge.BadgeContext;
import com.splitly.gamification.badge.BadgeRule;
import com.splitly.model.BadgeType;
import org.springframework.stereotype.Component;

@Component
public class TripCaptainRule implements BadgeRule {

    @Override
    public BadgeType badgeType() {
        return BadgeType.TRIP_CAPTAIN;
    }

    @Override
    public boolean isEligible(BadgeContext context) {
        return context.getTripExpensesPaid() >= 3;
    }
}
