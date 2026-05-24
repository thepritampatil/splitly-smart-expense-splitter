package com.splitly.algorithm;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

/**
 * =====================================================
 * DEBT SETTLEMENT OPTIMIZATION ALGORITHM
 * =====================================================
 *
 * PROBLEM:
 *   Given a group of people with net balances (positive = owed money,
 *   negative = owes money), find the minimum number of transactions
 *   needed to settle all debts.
 *
 * ALGORITHM:
 *   Greedy approach using two priority queues:
 *   - Max-heap for creditors (people owed the most)
 *   - Min-heap for debtors (people who owe the most)
 *
 *   At each step, match the largest creditor with the largest debtor.
 *   This minimizes the total number of transactions.
 *
 * TIME COMPLEXITY:  O(N log N) where N = number of people
 * SPACE COMPLEXITY: O(N)
 *
 * EXAMPLE:
 *   Input balances: A=+300, B=-100, C=-100, D=-100
 *   Naive transactions: B→A, C→A, D→A (3 transactions)
 *   Optimized: same 3 transactions (already optimal in this case)
 *
 *   Better example:
 *   A paid 100 for {A,B}, B paid 100 for {B,C}, C paid 100 for {A,C}
 *   Net: A=0, B=0, C=0 → no transactions needed!
 *
 * REFERENCE: This is the "Minimum Number of Arrows to Burst Balloons"
 *   family of greedy problems applied to financial graphs.
 * =====================================================
 */
@Component
@Slf4j
public class DebtOptimizationAlgorithm {

    /**
     * Represents a single optimized payment transaction
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Transaction {
        private Long fromUserId;
        private String fromUserName;
        private Long toUserId;
        private String toUserName;
        private BigDecimal amount;
    }

    /**
     * Input: Map of userId → net balance
     * Positive balance = owed money (creditor)
     * Negative balance = owes money (debtor)
     *
     * Output: Minimum list of transactions to settle all debts
     *
     * ALGORITHM STEPS:
     * 1. Separate into creditors and debtors
     * 2. Use greedy matching: largest creditor ↔ largest debtor
     * 3. Reduce balances and repeat until all settled
     */
    public List<Transaction> optimize(
            Map<Long, BigDecimal> balances,
            Map<Long, String> userNames
    ) {
        List<Transaction> result = new ArrayList<>();

        // Filter out zero balances (already settled)
        // Use priority queues for efficient greedy matching
        // Creditors: max-heap (those who should receive money)
        PriorityQueue<long[]> creditors = new PriorityQueue<>(
                (a, b) -> Long.compare(b[1], a[1]) // descending by balance (stored as cents)
        );

        // Debtors: max-heap by debt amount (those who owe money)
        PriorityQueue<long[]> debtors = new PriorityQueue<>(
                (a, b) -> Long.compare(b[1], a[1]) // descending by debt amount
        );

        // Convert BigDecimal to cents (long) for precise arithmetic
        // [0] = userId, [1] = balance in cents (absolute value)
        for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
            Long userId = entry.getKey();
            long cents = entry.getValue().multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP).longValue();

            if (cents > 0) {
                creditors.offer(new long[]{userId, cents});
            } else if (cents < 0) {
                debtors.offer(new long[]{userId, -cents}); // store as positive
            }
            // cents == 0: skip (already balanced)
        }

        // GREEDY MATCHING LOOP
        // Each iteration creates at most 1 transaction and eliminates
        // at least 1 person from either creditors or debtors
        while (!creditors.isEmpty() && !debtors.isEmpty()) {
            long[] creditor = creditors.poll(); // largest creditor
            long[] debtor = debtors.poll();     // largest debtor

            long creditorId = creditor[0];
            long debtorId = debtor[0];
            long creditAmount = creditor[1];
            long debtAmount = debtor[1];

            // The actual settlement amount is the minimum of the two
            long settlementCents = Math.min(creditAmount, debtAmount);

            BigDecimal settlementAmount = BigDecimal.valueOf(settlementCents)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            result.add(Transaction.builder()
                    .fromUserId(debtorId)
                    .fromUserName(userNames.getOrDefault(debtorId, "User " + debtorId))
                    .toUserId(creditorId)
                    .toUserName(userNames.getOrDefault(creditorId, "User " + creditorId))
                    .amount(settlementAmount)
                    .build());

            log.debug("Transaction: {} pays {} → {}",
                    userNames.get(debtorId), settlementAmount, userNames.get(creditorId));

            // Re-add with remaining balance if not fully settled
            long remainingCredit = creditAmount - settlementCents;
            long remainingDebt = debtAmount - settlementCents;

            if (remainingCredit > 0) {
                creditors.offer(new long[]{creditorId, remainingCredit});
            }
            if (remainingDebt > 0) {
                debtors.offer(new long[]{debtorId, remainingDebt});
            }
        }

        log.info("Debt optimization complete. {} transactions generated.", result.size());
        return result;
    }

    /**
     * Calculate the efficiency improvement over naive approach
     * Naive: every person pays every other person they owe
     * Optimized: minimum transactions via greedy algorithm
     *
     * @param naiveCount naive transaction count
     * @param optimizedCount optimized transaction count
     * @return percentage reduction
     */
    public double calculateEfficiency(int naiveCount, int optimizedCount) {
        if (naiveCount == 0) return 100.0;
        return ((double)(naiveCount - optimizedCount) / naiveCount) * 100.0;
    }
}
