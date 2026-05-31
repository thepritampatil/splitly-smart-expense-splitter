package com.splitly.dto;

import com.splitly.model.BadgeType;
import com.splitly.model.UserBadge;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class BadgeDto {
    BadgeType badgeType;
    Integer tier;
    LocalDateTime earnedAt;
    String metadata;

    public static BadgeDto from(UserBadge badge) {
        return BadgeDto.builder()
                .badgeType(badge.getBadgeType())
                .tier(badge.getTier())
                .earnedAt(badge.getEarnedAt())
                .metadata(badge.getMetadata())
                .build();
    }
}
