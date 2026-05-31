package com.splitly.gamification.badge;

import com.splitly.gamification.event.GamificationEvent;
import com.splitly.model.BadgeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BadgeEngineService {

    private final BadgeEvaluationService badgeEvaluationService;

    public List<BadgeType> processEvent(GamificationEvent event) {
        return badgeEvaluationService.evaluate(event);
    }
}
