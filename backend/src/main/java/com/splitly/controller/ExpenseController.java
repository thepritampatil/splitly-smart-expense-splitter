package com.splitly.controller;

import com.splitly.dto.*;
import com.splitly.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ExpenseDto>> getGroupExpenses(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getGroupExpenses(groupId));
    }

    @PostMapping
    public ResponseEntity<ExpenseDto> createExpense(@Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(expenseService.createExpense(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseDto> updateExpense(
            @PathVariable Long id, @Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(expenseService.updateExpense(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/group/{groupId}/balances")
    public ResponseEntity<List<BalanceDto>> getGroupBalances(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getGroupBalances(groupId));
    }

    @PostMapping("/preview")
    public ResponseEntity<SplitPreviewResponse> previewSplit(@Valid @RequestBody CreateExpenseRequest req) {
        return ResponseEntity.ok(expenseService.previewSplit(req));
    }
}
