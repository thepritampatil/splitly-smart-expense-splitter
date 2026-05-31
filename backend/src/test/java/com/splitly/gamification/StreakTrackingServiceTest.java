package com.splitly.gamification;

import com.splitly.model.User;
import com.splitly.model.UserStats;
import com.splitly.repository.UserRepository;
import com.splitly.repository.UserStatsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StreakTrackingServiceTest {

    @Mock
    private UserStatsRepository userStatsRepository;
    @Mock
    private UserRepository userRepository;

    private StreakTrackingService streakTrackingService;

    @BeforeEach
    void setUp() {
        UserStatsService userStatsService = new UserStatsService(userStatsRepository, userRepository);
        streakTrackingService = new StreakTrackingService(userStatsService);
    }

    @Test
    void consecutiveDays_incrementStreak() {
        User user = User.builder().id(1L).email("a@test.com").fullName("A").build();
        UserStats stats = UserStats.builder().user(user).userId(1L).streakCount(1)
                .lastSettlementDate(LocalDate.of(2026, 5, 26)).build();

        when(userStatsRepository.findById(1L)).thenReturn(Optional.of(stats));

        streakTrackingService.recordSettlementActivity(1L, LocalDate.of(2026, 5, 27));

        assertEquals(2, stats.getStreakCount());
        assertEquals(2, stats.getLongestStreak());
    }

    @Test
    void gap_resetsStreakToOne() {
        User user = User.builder().id(1L).email("a@test.com").fullName("A").build();
        UserStats stats = UserStats.builder().user(user).userId(1L).streakCount(5)
                .lastSettlementDate(LocalDate.of(2026, 5, 20)).longestStreak(5).build();

        when(userStatsRepository.findById(1L)).thenReturn(Optional.of(stats));

        streakTrackingService.recordSettlementActivity(1L, LocalDate.of(2026, 5, 27));

        assertEquals(1, stats.getStreakCount());
        assertEquals(5, stats.getLongestStreak());
    }
}
