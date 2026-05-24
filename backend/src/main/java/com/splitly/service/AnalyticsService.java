package com.splitly.service;

import com.splitly.dto.CategoryExpenseDto;
import com.splitly.dto.MonthlyExpenseDto;
import com.splitly.exception.UnauthorizedException;
import com.splitly.model.*;
import com.splitly.repository.ExpenseRepository;
import com.splitly.repository.GroupMemberRepository;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository memberRepository;
    private final AuthUtil authUtil;

    private static final Map<ExpenseCategory, String> CATEGORY_COLORS = Map.of(
        ExpenseCategory.FOOD, "#f97316",
        ExpenseCategory.UTILITIES, "#3b82f6",
        ExpenseCategory.INTERNET, "#8b5cf6",
        ExpenseCategory.TRAVEL, "#10b981",
        ExpenseCategory.SHOPPING, "#ec4899",
        ExpenseCategory.RENT, "#f59e0b",
        ExpenseCategory.OTHER, "#6b7280"
    );

    public List<MonthlyExpenseDto> getMonthlyExpenses(Long groupId) {
        User current = authUtil.getCurrentUser();
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, current.getId(), MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("Not a group member");
        }

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM yyyy");

        Map<String, BigDecimal> monthly = new TreeMap<>();
        for (Expense e : expenses) {
            if (e.getCreatedAt() != null) {
                String month = e.getCreatedAt().format(fmt);
                monthly.merge(month, e.getAmount(), BigDecimal::add);
            }
        }

        return monthly.entrySet().stream()
                .map(entry -> MonthlyExpenseDto.builder()
                        .month(entry.getKey())
                        .amount(entry.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    public List<CategoryExpenseDto> getCategoryExpenses(Long groupId) {
        User current = authUtil.getCurrentUser();
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, current.getId(), MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("Not a group member");
        }

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        Map<ExpenseCategory, BigDecimal> byCategory = new HashMap<>();

        for (Expense e : expenses) {
            byCategory.merge(e.getCategory(), e.getAmount(), BigDecimal::add);
        }

        return byCategory.entrySet().stream()
                .map(entry -> CategoryExpenseDto.builder()
                        .category(entry.getKey().name())
                        .amount(entry.getValue())
                        .color(CATEGORY_COLORS.getOrDefault(entry.getKey(), "#6b7280"))
                        .build())
                .collect(Collectors.toList());
    }
}
