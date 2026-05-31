package com.splitly.split;

import com.splitly.dto.ParticipantDto;
import com.splitly.model.SplitType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SplitCalculationService {

    private final SplitValidationService validationService;
    private final List<SplitStrategy> strategies;

    public List<ComputedShare> calculate(SplitType splitType, BigDecimal totalAmount, List<ParticipantDto> participants) {
        validationService.validate(splitType, totalAmount, participants);
        return resolveStrategy(splitType).compute(totalAmount, participants);
    }

    private SplitStrategy resolveStrategy(SplitType splitType) {
        Map<SplitType, SplitStrategy> byType = new EnumMap<>(SplitType.class);
        for (SplitStrategy strategy : strategies) {
            byType.put(strategy.getType(), strategy);
        }
        SplitStrategy strategy = byType.get(splitType);
        if (strategy == null) {
            throw new IllegalArgumentException("Unsupported split type: " + splitType);
        }
        return strategy;
    }
}
