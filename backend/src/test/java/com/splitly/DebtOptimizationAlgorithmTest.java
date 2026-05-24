package com.splitly;

import com.splitly.algorithm.DebtOptimizationAlgorithm;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Debt Optimization Algorithm Tests")
class DebtOptimizationAlgorithmTest {

    private DebtOptimizationAlgorithm algorithm;
    private Map<Long, String> userNames;

    @BeforeEach
    void setUp() {
        algorithm = new DebtOptimizationAlgorithm();
        userNames = new HashMap<>();
        userNames.put(1L, "Alice");
        userNames.put(2L, "Bob");
        userNames.put(3L, "Charlie");
        userNames.put(4L, "Diana");
    }

    @Test
    @DisplayName("No transactions when all balances are zero")
    void testZeroBalances() {
        Map<Long, BigDecimal> balances = Map.of(
            1L, BigDecimal.ZERO,
            2L, BigDecimal.ZERO
        );
        List<DebtOptimizationAlgorithm.Transaction> result = algorithm.optimize(balances, userNames);
        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Simple A owes B - single transaction")
    void testSimpleDebt() {
        Map<Long, BigDecimal> balances = Map.of(
            1L, new BigDecimal("-100"),  // Alice owes 100
            2L, new BigDecimal("100")   // Bob is owed 100
        );
        List<DebtOptimizationAlgorithm.Transaction> result = algorithm.optimize(balances, userNames);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getFromUserId());
        assertEquals(2L, result.get(0).getToUserId());
        assertEquals(new BigDecimal("100.00"), result.get(0).getAmount());
    }

    @Test
    @DisplayName("Three people - optimized to 2 transactions (not 3)")
    void testThreePeopleOptimization() {
        // A paid for B and C: A=+200, B=-100, C=-100
        Map<Long, BigDecimal> balances = Map.of(
            1L, new BigDecimal("200"),   // Alice is owed 200
            2L, new BigDecimal("-100"),  // Bob owes 100
            3L, new BigDecimal("-100")   // Charlie owes 100
        );
        List<DebtOptimizationAlgorithm.Transaction> result = algorithm.optimize(balances, userNames);
        assertEquals(2, result.size());

        // Verify total amount in transactions = 200
        BigDecimal total = result.stream()
                .map(DebtOptimizationAlgorithm.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, total.compareTo(new BigDecimal("200")));
    }

    @Test
    @DisplayName("Chain debt gets optimized: A→B→C becomes A→C")
    void testChainDebtOptimization() {
        // A owes B 100, B owes C 100 → should optimize to A owes C 100 (via net balances)
        // Net: A=-100, B=0, C=+100
        Map<Long, BigDecimal> balances = Map.of(
            1L, new BigDecimal("-100"),  // Alice net -100
            2L, BigDecimal.ZERO,         // Bob net 0
            3L, new BigDecimal("100")    // Charlie net +100
        );
        List<DebtOptimizationAlgorithm.Transaction> result = algorithm.optimize(balances, userNames);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getFromUserId()); // Alice pays
        assertEquals(3L, result.get(0).getToUserId());   // Charlie receives
    }

    @Test
    @DisplayName("Four people - verify transaction count is minimized")
    void testFourPeopleMinimization() {
        // Complex scenario with 4 people
        Map<Long, BigDecimal> balances = new HashMap<>();
        balances.put(1L, new BigDecimal("300"));   // Alice +300
        balances.put(2L, new BigDecimal("-100"));   // Bob -100
        balances.put(3L, new BigDecimal("-100"));   // Charlie -100
        balances.put(4L, new BigDecimal("-100"));   // Diana -100

        List<DebtOptimizationAlgorithm.Transaction> result = algorithm.optimize(balances, userNames);

        // Should be 3 transactions (one per debtor)
        assertEquals(3, result.size());

        // All transactions should go to Alice (id=1)
        result.forEach(t -> assertEquals(1L, t.getToUserId()));

        // Total should equal 300
        BigDecimal total = result.stream()
                .map(DebtOptimizationAlgorithm.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, total.compareTo(new BigDecimal("300")));
    }

    @Test
    @DisplayName("Net-zero group - no transactions needed")
    void testNetZeroGroup() {
        // Everyone paid for everyone else equally - net balances should cancel out
        Map<Long, BigDecimal> balances = Map.of(
            1L, new BigDecimal("50"),
            2L, new BigDecimal("-50"),
            3L, new BigDecimal("25"),
            4L, new BigDecimal("-25")
        );
        List<DebtOptimizationAlgorithm.Transaction> result = algorithm.optimize(balances, userNames);
        
        // Verify all transactions clear the debts
        BigDecimal netFlow = result.stream()
                .map(DebtOptimizationAlgorithm.Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        assertTrue(netFlow.compareTo(new BigDecimal("75")) == 0);
    }

    @Test
    @DisplayName("Efficiency calculation works correctly")
    void testEfficiencyCalculation() {
        double efficiency = algorithm.calculateEfficiency(10, 3);
        assertEquals(70.0, efficiency, 0.001);

        double noImprovement = algorithm.calculateEfficiency(5, 5);
        assertEquals(0.0, noImprovement, 0.001);

        double perfectOptimization = algorithm.calculateEfficiency(6, 0);
        assertEquals(100.0, perfectOptimization, 0.001);
    }
}
