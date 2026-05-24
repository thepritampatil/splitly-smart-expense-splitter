package com.splitly.repository;

import com.splitly.model.GroupMember;
import com.splitly.model.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    List<GroupMember> findByGroupIdAndStatus(Long groupId, MemberStatus status);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);

    boolean existsByGroupIdAndUserIdAndStatus(Long groupId, Long userId, MemberStatus status);

    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId")
    List<GroupMember> findAllByGroupId(Long groupId);
}
