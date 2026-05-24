package com.splitly.service;

import com.splitly.algorithm.DebtOptimizationAlgorithm;
import com.splitly.dto.*;
import com.splitly.exception.*;
import com.splitly.model.*;
import com.splitly.repository.*;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SettlementService {

    private final SettlementRepository settlementRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ExpenseService expenseService;
    private final ActivityService activityService;
    private final DebtOptimizationAlgorithm algorithm;
    private final AuthUtil authUtil;

    /**
     * Get all settlements for a group, ordered by date
     */
    public List<SettlementDto> getGroupSettlements(Long groupId) {
        User current = authUtil.getCurrentUser();
        verifyMember(groupId, current.getId());
        return settlementRepository.findByGroupId(groupId)
                .stream().map(SettlementDto::from)
                .sorted(Comparator.comparing(SettlementDto::getCreatedAt).reversed())
                .collect(Collectors.toList());
    }

    /**
     * Get optimized debt suggestions using the greedy algorithm.
     * Returns minimum transactions needed to settle all group debts.
     */
    public List<DebtDto> getOptimizedDebts(Long groupId) {
        User current = authUtil.getCurrentUser();
        verifyMember(groupId, current.getId());

        List<BalanceDto> balances = expenseService.getGroupBalances(groupId);

        // Account for already-completed settlements
        List<Settlement> completedSettlements = settlementRepository
                .findByGroupIdAndStatus(groupId, SettlementStatus.COMPLETED);

        Map<Long, BigDecimal> netBalances = new HashMap<>();
        Map<Long, String> userNames = new HashMap<>();

        for (BalanceDto b : balances) {
            netBalances.put(b.userId, b.netBalance);
            userNames.put(b.userId, b.fullName);
        }

        // Adjust for completed settlements
        for (Settlement s : completedSettlements) {
            Long payerId = s.getPayer().getId();
            Long receiverId = s.getReceiver().getId();
            // Payer's balance improves (they already settled)
            netBalances.merge(payerId, s.getAmount(), BigDecimal::add);
            // Receiver's balance decreases
            netBalances.merge(receiverId, s.getAmount().negate(), BigDecimal::add);
        }

        List<DebtOptimizationAlgorithm.Transaction> txns = algorithm.optimize(netBalances, userNames);

        return txns.stream().map(t -> DebtDto.builder()
                .fromUserId(t.getFromUserId())
                .fromUserName(t.getFromUserName())
                .toUserId(t.getToUserId())
                .toUserName(t.getToUserName())
                .amount(t.getAmount())
                .build())
                .collect(Collectors.toList());
    }

    /**
     * STEP 1: Debtor initiates payment → status moves to PROCESSING
     * Only the debtor (payer) can initiate this.
     */
    @Transactional
    public SettlementDto initiatePayment(InitiatePaymentRequest req) {
        User payer = authUtil.getCurrentUser();
        Group group = groupRepository.findById(req.groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", req.groupId));
        User receiver = userRepository.findById(req.receiverId)
                .orElseThrow(() -> new ResourceNotFoundException("User", req.receiverId));

        verifyMember(req.groupId, payer.getId());

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

    /**
     * STEP 2: Receiver confirms payment → status moves to COMPLETED
     * Only the receiver can confirm. Balances are updated automatically.
     */
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

        return SettlementDto.from(settlement);
    }

    /**
     * Decline a payment (receiver rejects the claim)
     */
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
        return SettlementDto.from(settlementRepository.save(settlement));
    }

    private void verifyMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("You are not a member of this group");
        }
    }
}
