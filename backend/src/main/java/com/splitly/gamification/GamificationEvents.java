package com.splitly.gamification;

import com.splitly.gamification.event.GamificationEvent;
import com.splitly.gamification.event.GamificationEventType;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

public final class GamificationEvents {

    private GamificationEvents() {}

    public static GamificationEvent expenseCreated(Long userId, Long groupId, Long expenseId, BigDecimal amount) {
        return GamificationEvent.builder()
                .eventType(GamificationEventType.EXPENSE_CREATED)
                .actorUserId(userId)
                .groupId(groupId)
                .referenceId(expenseId)
                .amount(amount)
                .happenedAt(LocalDateTime.now())
                .metadata(Map.of())
                .build();
    }

    public static GamificationEvent expenseDeleted(Long userId, Long groupId, Long expenseId) {
        return GamificationEvent.builder()
                .eventType(GamificationEventType.EXPENSE_DELETED)
                .actorUserId(userId)
                .groupId(groupId)
                .referenceId(expenseId)
                .happenedAt(LocalDateTime.now())
                .metadata(Map.of())
                .build();
    }

    public static GamificationEvent settlementCompleted(Long payerId, Long groupId, Long settlementId) {
        return GamificationEvent.builder()
                .eventType(GamificationEventType.SETTLEMENT_COMPLETED)
                .actorUserId(payerId)
                .groupId(groupId)
                .referenceId(settlementId)
                .happenedAt(LocalDateTime.now())
                .metadata(Map.of())
                .build();
    }

    public static GamificationEvent settlementDeclined(Long payerId, Long groupId, Long settlementId) {
        return GamificationEvent.builder()
                .eventType(GamificationEventType.SETTLEMENT_DECLINED)
                .actorUserId(payerId)
                .groupId(groupId)
                .referenceId(settlementId)
                .happenedAt(LocalDateTime.now())
                .metadata(Map.of())
                .build();
    }

    public static GamificationEvent groupMemberJoined(Long userId, Long groupId) {
        return GamificationEvent.builder()
                .eventType(GamificationEventType.GROUP_MEMBER_JOINED)
                .actorUserId(userId)
                .groupId(groupId)
                .happenedAt(LocalDateTime.now())
                .metadata(Map.of())
                .build();
    }

    public static GamificationEvent optimizationCompleted(Long groupId, Long userId) {
        return GamificationEvent.builder()
                .eventType(GamificationEventType.OPTIMIZATION_COMPLETED)
                .actorUserId(userId)
                .groupId(groupId)
                .happenedAt(LocalDateTime.now())
                .metadata(Map.of())
                .build();
    }
}
