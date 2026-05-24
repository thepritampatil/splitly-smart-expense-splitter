package com.splitly.repository;

import com.splitly.model.Settlement;
import com.splitly.model.SettlementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SettlementRepository extends JpaRepository<Settlement, Long> {

    List<Settlement> findByGroupId(Long groupId);

    List<Settlement> findByGroupIdAndStatus(Long groupId, SettlementStatus status);

    @Query("SELECT s FROM Settlement s WHERE s.group.id = :groupId AND (s.payer.id = :userId OR s.receiver.id = :userId) ORDER BY s.createdAt DESC")
    List<Settlement> findByGroupIdAndUserId(Long groupId, Long userId);

    @Query("SELECT s FROM Settlement s WHERE (s.payer.id = :userId OR s.receiver.id = :userId) ORDER BY s.createdAt DESC")
    List<Settlement> findAllByUserId(Long userId);

    Optional<Settlement> findByIdAndPayerId(Long id, Long payerId);

    Optional<Settlement> findByIdAndReceiverId(Long id, Long receiverId);
}
