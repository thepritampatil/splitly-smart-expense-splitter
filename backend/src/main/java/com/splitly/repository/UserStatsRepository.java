package com.splitly.repository;

import com.splitly.model.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
    List<UserStats> findTop10ByOrderByTrustScoreDesc();
    List<UserStats> findTop10ByOrderByStreakCountDesc();
    List<UserStats> findTop10ByOrderByContributionScoreDesc();
}
