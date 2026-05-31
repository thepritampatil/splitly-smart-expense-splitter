package com.splitly.gamification.badge;

import com.splitly.gamification.UserStatsService;
import com.splitly.gamification.event.GamificationEvent;
import com.splitly.model.ExpenseCategory;
import com.splitly.model.GroupType;
import com.splitly.model.UserStats;
import com.splitly.repository.ActivityRepository;
import com.splitly.repository.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BadgeMetricsService {

    private final UserStatsService userStatsService;
    private final ExpenseRepository expenseRepository;
    private final ActivityRepository activityRepository;

    public BadgeContext buildContext(GamificationEvent event) {
        Long userId = event.getActorUserId() != null ? event.getActorUserId() : event.getTargetUserId();
        if (userId == null) {
            return null;
        }
        UserStats stats = userStatsService.getOrCreate(userId);
        long groupActivity = 0;
        if (event.getGroupId() != null) {
            groupActivity = activityRepository.countByGroupIdAndTriggeredById(event.getGroupId(), userId);
        }
        return BadgeContext.builder()
                .event(event)
                .stats(stats)
                .expensesCreated(expenseRepository.countByPaidById(userId))
                .foodExpensesPaid(expenseRepository.countByPaidByIdAndCategory(userId, ExpenseCategory.FOOD))
                .tripExpensesPaid(expenseRepository.countByPaidByIdAndGroupType(userId, GroupType.TRIP))
                .groupActivityCount(groupActivity)
                .build();
    }
}
