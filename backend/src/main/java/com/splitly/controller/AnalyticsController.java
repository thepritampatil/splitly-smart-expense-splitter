package com.splitly.controller;

import com.splitly.dto.CategoryExpenseDto;
import com.splitly.dto.MonthlyExpenseDto;
import com.splitly.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/monthly/{groupId}")
    public ResponseEntity<List<MonthlyExpenseDto>> getMonthly(@PathVariable Long groupId) {
        return ResponseEntity.ok(analyticsService.getMonthlyExpenses(groupId));
    }

    @GetMapping("/category/{groupId}")
    public ResponseEntity<List<CategoryExpenseDto>> getCategory(@PathVariable Long groupId) {
        return ResponseEntity.ok(analyticsService.getCategoryExpenses(groupId));
    }
}
