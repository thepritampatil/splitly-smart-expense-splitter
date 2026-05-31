package com.splitly.gamification.badge.rules;

import com.splitly.gamification.badge.BadgeContext;
import com.splitly.gamification.badge.BadgeRule;
import com.splitly.model.BadgeType;
import org.springframework.stereotype.Component;

@Component
public class ConsistentContributorRule implements BadgeRule {

    @Override
    public BadgeType badgeType() {
        return BadgeType.CONSISTENT_CONTRIBUTOR;
    }

    @Override
    public boolean isEligible(BadgeContext context) {
        return context.getStats().getStreakCount() >= 7;
    }
}
