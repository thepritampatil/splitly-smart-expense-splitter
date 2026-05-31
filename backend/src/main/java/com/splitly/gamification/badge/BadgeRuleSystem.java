package com.splitly.gamification.badge;

import com.splitly.model.BadgeType;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Component
public class BadgeRuleSystem {

    private final Map<BadgeType, BadgeRule> rulesByType;

    public BadgeRuleSystem(List<BadgeRule> rules) {
        Map<BadgeType, BadgeRule> map = new EnumMap<>(BadgeType.class);
        for (BadgeRule rule : rules) {
            map.put(rule.badgeType(), rule);
        }
        this.rulesByType = Map.copyOf(map);
    }

    public List<BadgeRule> allRules() {
        return List.copyOf(rulesByType.values());
    }

    public BadgeRule get(BadgeType type) {
        return rulesByType.get(type);
    }
}
