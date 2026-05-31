package com.splitly.service;

import com.splitly.balance.BalanceCalculationService;
import com.splitly.dto.*;
import com.splitly.exception.*;
import com.splitly.model.*;
import com.splitly.gamification.GamificationEvents;
import com.splitly.gamification.event.DomainEventPublisher;
import com.splitly.optimization.DebtOptimizationService;
import com.splitly.repository.*;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final BalanceCalculationService balanceCalculationService;
    private final DebtOptimizationService debtOptimizationService;
    private final AuthUtil authUtil;
    private final DomainEventPublisher domainEventPublisher;

    public List<SettlementDto> getGroupSettlements(Long groupId) {
        User current = authUtil.getCurrentUser();
        balanceCalculationService.verifyMember(groupId, current.getId());
        return settlementRepository.findByGroupId(groupId)
                .stream().map(SettlementDto::from)
                .sorted(Comparator.comparing(SettlementDto::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    public List<DebtDto> getOptimizedDebts(Long groupId) {
        return getOptimizationSummary(groupId).transactions;
    }

    public OptimizationSummaryDto getOptimizationSummary(Long groupId) {
        User current = authUtil.getCurrentUser();
        balanceCalculationService.verifyMember(groupId, current.getId());
        List<BalanceDto> balances = balanceCalculationService.calculateGroupBalances(groupId);
        OptimizationSummaryDto summary = debtOptimizationService.optimize(groupId, balances);
        domainEventPublisher.publishGamificationEvent(
                GamificationEvents.optimizationCompleted(groupId, current.getId()));
        return summary;
    }

    @Transactional
    public SettlementDto initiatePayment(InitiatePaymentRequest req) {
        User payer = authUtil.getCurrentUser();
        Group group = groupRepository.findById(req.groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", req.groupId));
        User receiver = userRepository.findById(req.receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", req.receiverId));

        balanceCalculationService.verifyMember(req.groupId, payer.getId());

        if (payer.getId().equals(receiver.getId())) {
            throw new BadRequestException("Cannot settle with yourself");
        }

        Settlement settlement = Settlement.builder()
                .payer(payer)
                .receiver(receiver)
                .amount(req.amount)
                .status(SettlementStatus.PROCESSING)
                .group(group)
                .build();

        settlement = settlementRepository.save(settlement);

        activityService.log(
            ActivityType.SETTLEMENT_INITIATED, group,
            payer.getFullName() + " marked payment of ₹" + req.amount +
            " to " + receiver.getFullName() + " as sent", payer
        );

        return SettlementDto.from(settlement);
    }

    @Transactional
    public SettlementDto confirmPayment(ConfirmPaymentRequest req) {
        User receiver = authUtil.getCurrentUser();
        Settlement settlement = settlementRepository.findById(req.settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement", req.settlementId));

        if (!settlement.getReceiver().getId().equals(receiver.getId())) {
            throw new UnauthorizedException("Only the receiver can confirm payment");
        }

        if (settlement.getStatus() != SettlementStatus.PROCESSING) {
            throw new BadRequestException("Settlement is not in PROCESSING state");
        }

        settlement.setStatus(SettlementStatus.COMPLETED);
        settlement.setSettledAt(LocalDateTime.now());
        settlement = settlementRepository.save(settlement);

        activityService.log(
            ActivityType.SETTLEMENT_CONFIRMED, settlement.getGroup(),
            receiver.getFullName() + " confirmed payment of ₹" + settlement.getAmount() +
            " from " + settlement.getPayer().getFullName(), receiver
        );

        domainEventPublisher.publishGamificationEvent(
                GamificationEvents.settlementCompleted(
                        settlement.getPayer().getId(),
                        settlement.getGroup().getId(),
                        settlement.getId()));

        return SettlementDto.from(settlement);
    }

    @Transactional
    public SettlementDto declinePayment(Long settlementId) {
        User receiver = authUtil.getCurrentUser();
        Settlement settlement = settlementRepository.findById(settlementId)
                .orElseThrow(() -> new ResourceNotFoundException("Settlement", settlementId));

        if (!settlement.getReceiver().getId().equals(receiver.getId())) {
            throw new UnauthorizedException("Only the receiver can decline payment");
        }

        if (settlement.getStatus() != SettlementStatus.PROCESSING) {
            throw new BadRequestException("Settlement is not in PROCESSING state");
        }

        settlement.setStatus(SettlementStatus.PENDING);
        settlement = settlementRepository.save(settlement);

        domainEventPublisher.publishGamificationEvent(
                GamificationEvents.settlementDeclined(
                        settlement.getPayer().getId(),
                        settlement.getGroup().getId(),
                        settlement.getId()));

        return SettlementDto.from(settlement);
    }
}
