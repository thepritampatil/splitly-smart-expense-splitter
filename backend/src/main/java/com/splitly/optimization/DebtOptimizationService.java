package com.splitly.optimization;

import com.splitly.algorithm.DebtOptimizationAlgorithm;
import com.splitly.dto.BalanceDto;
import com.splitly.dto.DebtDto;
import com.splitly.dto.OptimizationSummaryDto;
import com.splitly.model.Settlement;
import com.splitly.model.SettlementStatus;
import com.splitly.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DebtOptimizationService {

    private final DebtOptimizationAlgorithm algorithm;
    private final SettlementRepository settlementRepository;

    public OptimizationSummaryDto optimize(Long groupId, List<BalanceDto> balances) {
        Map<Long, BigDecimal> netBalances = new HashMap<>();
        Map<Long, String> userNames = new HashMap<>();

        for (BalanceDto b : balances) {
            netBalances.put(b.userId, b.netBalance);
            userNames.put(b.userId, b.fullName);
        }

        List<Settlement> completedSettlements = settlementRepository
                .findByGroupIdAndStatus(groupId, SettlementStatus.COMPLETED);

        for (Settlement s : completedSettlements) {
            Long payerId = s.getPayer().getId();
            Long receiverId = s.getReceiver().getId();
            netBalances.merge(payerId, s.getAmount(), BigDecimal::add);
            netBalances.merge(receiverId, s.getAmount().negate(), BigDecimal::add);
        }

        List<DebtOptimizationAlgorithm.Transaction> txns = algorithm.optimize(netBalances, userNames);

        List<DebtDto> debts = txns.stream().map(t -> DebtDto.builder()
                .fromUserId(t.getFromUserId())
                .fromUserName(t.getFromUserName())
                .toUserId(t.getToUserId())
                .toUserName(t.getToUserName())
                .amount(t.getAmount())
                .build())
                .collect(Collectors.toList());

        int naiveCount = countNaiveTransactions(netBalances);
        int optimizedCount = debts.size();
        boolean allSettled = optimizedCount == 0 && naiveCount == 0;

        return OptimizationSummaryDto.builder()
                .transactions(debts)
                .optimizedTransactionCount(optimizedCount)
                .naiveTransactionCount(naiveCount)
                .reductionPercent(algorithm.calculateEfficiency(naiveCount, optimizedCount))
                .allSettled(allSettled)
                .build();
    }

    /**
     * Upper-bound estimate: each debtor pays each creditor they could owe (bilateral arcs).
     */
    private int countNaiveTransactions(Map<Long, BigDecimal> netBalances) {
        List<Long> debtors = netBalances.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) < 0)
                .map(Map.Entry::getKey)
                .toList();
        List<Long> creditors = netBalances.entrySet().stream()
                .filter(e -> e.getValue().compareTo(BigDecimal.ZERO) > 0)
                .map(Map.Entry::getKey)
                .toList();

        if (debtors.isEmpty() || creditors.isEmpty()) {
            return 0;
        }
        return debtors.size() * creditors.size();
    }
}
