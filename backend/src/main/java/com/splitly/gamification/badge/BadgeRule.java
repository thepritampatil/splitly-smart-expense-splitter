package com.splitly.gamification.badge;

import com.splitly.model.BadgeType;

public interface BadgeRule {
    BadgeType badgeType();

    boolean isEligible(BadgeContext context);

    default String metadata(BadgeContext context) {
        return null;
    }
}
