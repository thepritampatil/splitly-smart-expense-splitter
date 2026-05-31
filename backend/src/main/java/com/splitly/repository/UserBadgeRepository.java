package com.splitly.repository;

import com.splitly.model.BadgeType;
import com.splitly.model.UserBadge;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    boolean existsByUserIdAndBadgeTypeAndTier(Long userId, BadgeType badgeType, Integer tier);
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(Long userId);
    List<UserBadge> findByUserIdOrderByEarnedAtDesc(Long userId, Pageable pageable);
}
