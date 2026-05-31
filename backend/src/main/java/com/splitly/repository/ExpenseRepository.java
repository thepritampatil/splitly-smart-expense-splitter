package com.splitly.repository;

import com.splitly.model.Expense;
import com.splitly.model.ExpenseCategory;
import com.splitly.model.GroupType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT e FROM Expense e WHERE e.group.id = :groupId ORDER BY e.createdAt DESC")
    List<Expense> findByGroupId(Long groupId);

    @Query("SELECT e FROM Expense e WHERE e.group.id = :groupId AND e.createdAt BETWEEN :from AND :to ORDER BY e.createdAt DESC")
    List<Expense> findByGroupIdAndDateRange(Long groupId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT e FROM Expense e JOIN e.participants p WHERE p.user.id = :userId ORDER BY e.createdAt DESC")
    List<Expense> findExpensesByUserId(Long userId);

    long countByPaidById(Long userId);

    long countByPaidByIdAndCategory(Long userId, ExpenseCategory category);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.paidBy.id = :userId AND e.group.type = :groupType")
    long countByPaidByIdAndGroupType(Long userId, GroupType groupType);

    @Query("SELECT COUNT(e) FROM Expense e WHERE e.paidBy.id = :userId AND e.group.id = :groupId AND e.createdAt >= :since")
    long countByPaidByIdAndGroupIdSince(Long userId, Long groupId, LocalDateTime since);
}
