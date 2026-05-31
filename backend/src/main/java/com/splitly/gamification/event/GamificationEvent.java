package com.splitly.gamification.event;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Value
@Builder
public class GamificationEvent {
    GamificationEventType eventType;
    Long actorUserId;
    Long targetUserId;
    Long groupId;
    Long referenceId;
    BigDecimal amount;
    LocalDateTime happenedAt;
    Map<String, Object> metadata;
}
