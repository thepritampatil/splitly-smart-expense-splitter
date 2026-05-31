package com.splitly.repository;

import com.splitly.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    @Query("SELECT a FROM Activity a WHERE a.group.id = :groupId ORDER BY a.timestamp DESC")
    List<Activity> findByGroupId(Long groupId);

    @Query("SELECT a FROM Activity a JOIN a.group g JOIN g.members m WHERE m.user.id = :userId AND m.status = 'ACCEPTED' ORDER BY a.timestamp DESC")
    List<Activity> findAllActivitiesForUser(Long userId);

    @Query("SELECT COUNT(a) FROM Activity a WHERE a.group.id = :groupId AND a.triggeredBy.id = :userId")
    long countByGroupIdAndTriggeredById(Long groupId, Long userId);
}
