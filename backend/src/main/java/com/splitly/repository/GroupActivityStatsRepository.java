package com.splitly.repository;

import com.splitly.model.GroupActivityStats;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface GroupActivityStatsRepository extends JpaRepository<GroupActivityStats, Long> {
    Optional<GroupActivityStats> findByGroupIdAndDayBucket(Long groupId, LocalDate dayBucket);
    List<GroupActivityStats> findByGroupIdAndDayBucketBetweenOrderByDayBucketAsc(Long groupId, LocalDate from, LocalDate to);
}
