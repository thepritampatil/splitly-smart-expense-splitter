package com.splitly.gamification;

import com.splitly.gamification.badge.BadgeEngineService;
import com.splitly.gamification.event.GamificationEvent;
import com.splitly.gamification.event.GamificationEventType;
import com.splitly.model.Settlement;
import com.splitly.repository.ExpenseRepository;
import com.splitly.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
@RequiredArgsConstructor
@Slf4j
public class GamificationProcessor {

    private static final int DAILY_EXPENSE_CAP_PER_GROUP = 25;

    private final StreakTrackingService streakTrackingService;
    private final TrustScoreService trustScoreService;
    private final GroupActivityService groupActivityService;
    private final BadgeEngineService badgeEngineService;
    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;

    @EventListener
    @Transactional
    public void onGamificationEvent(GamificationEvent event) {
        try {
            switch (event.getEventType()) {
                case EXPENSE_CREATED -> handleExpenseCreated(event);
                case EXPENSE_DELETED -> { /* counters remain; no badge revoke in v1 */ }
                case SETTLEMENT_COMPLETED -> handleSettlementCompleted(event);
                case SETTLEMENT_DECLINED -> handleSettlementDeclined(event);
                case GROUP_MEMBER_JOINED -> { /* optional future */ }
                case OPTIMIZATION_COMPLETED -> {
                    if (event.getGroupId() != null) {
                        groupActivityService.recordSettlement(event.getGroupId());
                    }
                }
                default -> { }
            }
            badgeEngineService.processEvent(event);
        } catch (Exception ex) {
            log.warn("Gamification processing failed for {}: {}", event.getEventType(), ex.getMessage());
        }
    }

    private void handleExpenseCreated(GamificationEvent event) {
        Long userId = event.getActorUserId();
        Long groupId = event.getGroupId();
        if (userId == null || groupId == null) return;

        LocalDateTime since = LocalDate.now().atStartOfDay();
        long todayCount = expenseRepository.countByPaidByIdAndGroupIdSince(userId, groupId, since);
        if (todayCount > DAILY_EXPENSE_CAP_PER_GROUP) {
            log.debug("Skipping contribution for user {} — daily cap reached", userId);
            return;
        }

        trustScoreService.recordContribution(userId, BigDecimal.ONE);
        groupActivityService.recordExpense(groupId);
    }

    private void handleSettlementCompleted(GamificationEvent event) {
        Long payerId = event.getActorUserId();
        if (payerId == null) return;

        boolean onTime = true;
        if (event.getReferenceId() != null) {
            Settlement settlement = settlementRepository.findById(event.getReferenceId()).orElse(null);
            if (settlement != null && settlement.getCreatedAt() != null && event.getHappenedAt() != null) {
                long hours = ChronoUnit.HOURS.between(settlement.getCreatedAt(), event.getHappenedAt());
                onTime = hours <= 72;
            }
        }

        LocalDate settlementDate = event.getHappenedAt() != null
                ? event.getHappenedAt().toLocalDate()
                : LocalDate.now();
        streakTrackingService.recordSettlementActivity(payerId, settlementDate);
        trustScoreService.recordSettlementCompleted(payerId, onTime);

        if (event.getGroupId() != null) {
            groupActivityService.recordSettlement(event.getGroupId());
        }
    }

    private void handleSettlementDeclined(GamificationEvent event) {
        Long payerId = event.getActorUserId();
        if (payerId == null) return;
        // Soft penalty: small trust adjustment via recalculation only
        trustScoreService.recordContribution(payerId, BigDecimal.valueOf(-0.5));
    }
}
