package com.splitly.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "group_activity_stats", uniqueConstraints = {
        @UniqueConstraint(name = "uk_group_day_bucket", columnNames = {"group_id", "day_bucket"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupActivityStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @Column(name = "day_bucket", nullable = false)
    private LocalDate dayBucket;

    @Column(name = "expense_count", nullable = false)
    @Builder.Default
    private Integer expenseCount = 0;

    @Column(name = "settlement_count", nullable = false)
    @Builder.Default
    private Integer settlementCount = 0;

    @Column(name = "active_participants", nullable = false)
    @Builder.Default
    private Integer activeParticipants = 0;

    @Column(name = "activity_score", nullable = false, precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal activityScore = BigDecimal.ZERO;
}
