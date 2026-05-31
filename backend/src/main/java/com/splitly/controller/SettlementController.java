package com.splitly.controller;

import com.splitly.dto.*;
import com.splitly.service.SettlementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<SettlementDto>> getGroupSettlements(@PathVariable Long groupId) {
        return ResponseEntity.ok(settlementService.getGroupSettlements(groupId));
    }

    @GetMapping("/group/{groupId}/optimized")
    public ResponseEntity<List<DebtDto>> getOptimizedDebts(@PathVariable Long groupId) {
        return ResponseEntity.ok(settlementService.getOptimizedDebts(groupId));
    }

    @GetMapping("/group/{groupId}/optimized/summary")
    public ResponseEntity<OptimizationSummaryDto> getOptimizationSummary(@PathVariable Long groupId) {
        return ResponseEntity.ok(settlementService.getOptimizationSummary(groupId));
    }

    @PostMapping("/pay")
    public ResponseEntity<SettlementDto> initiatePayment(@Valid @RequestBody InitiatePaymentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(settlementService.initiatePayment(req));
    }

    @PostMapping("/confirm")
    public ResponseEntity<SettlementDto> confirmPayment(@Valid @RequestBody ConfirmPaymentRequest req) {
        return ResponseEntity.ok(settlementService.confirmPayment(req));
    }

    @PostMapping("/{id}/decline")
    public ResponseEntity<SettlementDto> declinePayment(@PathVariable Long id) {
        return ResponseEntity.ok(settlementService.declinePayment(id));
    }
}
