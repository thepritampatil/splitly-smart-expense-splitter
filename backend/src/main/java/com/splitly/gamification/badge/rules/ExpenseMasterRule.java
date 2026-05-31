package com.splitly.gamification.badge.rules;

import com.splitly.gamification.badge.BadgeContext;
import com.splitly.gamification.badge.BadgeRule;
import com.splitly.model.BadgeType;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMasterRule implements BadgeRule {

    @Override
    public BadgeType badgeType() {
        return BadgeType.EXPENSE_MASTER;
    }

    @Override
    public boolean isEligible(BadgeContext context) {
        return context.getExpensesCreated() >= 20;
    }
}
