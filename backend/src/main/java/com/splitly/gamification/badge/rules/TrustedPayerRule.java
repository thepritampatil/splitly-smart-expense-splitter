package com.splitly.gamification.badge.rules;

import com.splitly.gamification.badge.BadgeContext;
import com.splitly.gamification.badge.BadgeRule;
import com.splitly.model.BadgeType;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class TrustedPayerRule implements BadgeRule {

    @Override
    public BadgeType badgeType() {
        return BadgeType.TRUSTED_PAYER;
    }

    @Override
    public boolean isEligible(BadgeContext context) {
        return context.getStats().getTrustScore().compareTo(BigDecimal.valueOf(80)) >= 0;
    }
}
