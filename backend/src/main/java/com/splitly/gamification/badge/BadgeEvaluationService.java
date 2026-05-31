package com.splitly.gamification.badge;

import com.splitly.gamification.event.GamificationEvent;
import com.splitly.model.BadgeType;
import com.splitly.model.User;
import com.splitly.model.UserBadge;
import com.splitly.repository.UserBadgeRepository;
import com.splitly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeEvaluationService {

    private final BadgeRuleSystem badgeRuleSystem;
    private final BadgeMetricsService badgeMetricsService;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    @Transactional
    public List<BadgeType> evaluate(GamificationEvent event) {
        BadgeContext context = badgeMetricsService.buildContext(event);
        if (context == null) {
            return List.of();
        }
        Long userId = context.getStats().getUserId();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }

        List<BadgeType> unlocked = new ArrayList<>();
        for (BadgeRule rule : badgeRuleSystem.allRules()) {
            if (!rule.isEligible(context)) {
                continue;
            }
            if (userBadgeRepository.existsByUserIdAndBadgeTypeAndTier(userId, rule.badgeType(), 1)) {
                continue;
            }
            userBadgeRepository.save(UserBadge.builder()
                    .user(user)
                    .badgeType(rule.badgeType())
                    .tier(1)
                    .earnedAt(LocalDateTime.now())
                    .sourceEvent(event.getEventType().name())
                    .metadata(rule.metadata(context))
                    .build());
            unlocked.add(rule.badgeType());
        }
        return unlocked;
    }
}
