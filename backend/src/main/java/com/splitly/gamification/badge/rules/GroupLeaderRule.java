package com.splitly.gamification.badge.rules;

import com.splitly.gamification.badge.BadgeContext;
import com.splitly.gamification.badge.BadgeRule;
import com.splitly.model.BadgeType;
import org.springframework.stereotype.Component;

@Component
public class GroupLeaderRule implements BadgeRule {

    @Override
    public BadgeType badgeType() {
        return BadgeType.GROUP_LEADER;
    }

    @Override
    public boolean isEligible(BadgeContext context) {
        return context.getGroupActivityCount() >= 15;
    }
}
