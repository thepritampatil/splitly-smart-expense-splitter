package com.splitly.gamification.event;

public interface DomainEventPublisher {
    void publishGamificationEvent(GamificationEvent event);
}
