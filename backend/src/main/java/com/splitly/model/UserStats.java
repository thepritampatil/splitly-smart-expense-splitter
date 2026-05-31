package com.splitly.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStats {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "trust_score", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal trustScore = BigDecimal.valueOf(50);

    @Column(name = "streak_count", nullable = false)
    @Builder.Default
    private Integer streakCount = 0;

    @Column(name = "longest_streak", nullable = false)
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_settlement_date")
    private LocalDate lastSettlementDate;

    @Column(name = "total_settlements", nullable = false)
    @Builder.Default
    private Integer totalSettlements = 0;

    @Column(name = "on_time_settlements", nullable = false)
    @Builder.Default
    private Integer onTimeSettlements = 0;

    @Column(name = "settlement_success_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal settlementSuccessRate = BigDecimal.ZERO;

    @Column(name = "contribution_score", nullable = false, precision = 7, scale = 2)
    @Builder.Default
    private BigDecimal contributionScore = BigDecimal.ZERO;

    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;
}
