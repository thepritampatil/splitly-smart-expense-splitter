package com.splitly.repository;

import com.splitly.model.Group;
import com.splitly.model.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {

    @Query("SELECT DISTINCT g FROM Group g JOIN g.members m WHERE m.user.id = :userId AND m.status = :status AND g.archived = false")
    List<Group> findGroupsByUserId(Long userId, MemberStatus status);

    @Query("SELECT DISTINCT g FROM Group g JOIN g.members m WHERE m.user.id = :userId AND m.status = :status")
    List<Group> findAllGroupsByUserId(Long userId, MemberStatus status);

    @Query("SELECT g FROM Group g JOIN g.members m WHERE g.id = :groupId AND m.user.id = :userId AND m.status = 'ACCEPTED'")
    Optional<Group> findGroupByIdAndMember(Long groupId, Long userId);
}
