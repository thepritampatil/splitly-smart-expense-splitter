package com.splitly.repository;

import com.splitly.model.Expense;
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
}
