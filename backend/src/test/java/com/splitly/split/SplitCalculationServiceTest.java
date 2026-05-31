package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.exception.BadRequestException;
import com.splitly.model.SplitType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SplitCalculationServiceTest {

    private SplitCalculationService service;

    @BeforeEach
    void setUp() {
        service = new SplitCalculationService(
                new SplitValidationService(),
                List.of(new EqualSplitStrategy(), new ExactSplitStrategy(), new PercentageSplitStrategy())
        );
    }

    @Test
    void equalSplit_distributesWithRemainderOnLast() {
        var participants = List.of(
                new ParticipantDto(1L, null, null),
                new ParticipantDto(2L, null, null),
                new ParticipantDto(3L, null, null)
        );
        var shares = service.calculate(SplitType.EQUAL, new BigDecimal("100.00"), participants);
        BigDecimal total = shares.stream().map(ComputedShare::getShareAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        assertEquals(0, total.compareTo(new BigDecimal("100.00")));
        assertEquals(new BigDecimal("33.34"), shares.get(2).getShareAmount());
    }

    @Test
    void exactSplit_requiresMatchingTotal() {
        var participants = List.of(
                new ParticipantDto(1L, new BigDecimal("60"), null),
                new ParticipantDto(2L, new BigDecimal("50"), null)
        );
        assertThrows(BadRequestException.class,
                () -> service.calculate(SplitType.EXACT, new BigDecimal("100"), participants));
    }

    @Test
    void percentageSplit_requires100Percent() {
        var participants = List.of(
                new ParticipantDto(1L, null, new BigDecimal("50")),
                new ParticipantDto(2L, null, new BigDecimal("40"))
        );
        assertThrows(BadRequestException.class,
                () -> service.calculate(SplitType.PERCENTAGE, new BigDecimal("100"), participants));
    }

    @Test
    void percentageSplit_computesAmounts() {
        var participants = List.of(
                new ParticipantDto(1L, null, new BigDecimal("50")),
                new ParticipantDto(2L, null, new BigDecimal("50"))
        );
        var shares = service.calculate(SplitType.PERCENTAGE, new BigDecimal("100"), participants);
        assertEquals(new BigDecimal("50.00"), shares.get(0).getShareAmount());
        assertEquals(new BigDecimal("50.00"), shares.get(1).getShareAmount());
    }
}
