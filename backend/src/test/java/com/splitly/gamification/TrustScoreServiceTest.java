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

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TrustScoreServiceTest {

    @Mock
    private UserStatsRepository userStatsRepository;
    @Mock
    private UserRepository userRepository;

    private UserStatsService userStatsService;
    private TrustScoreService trustScoreService;

    @BeforeEach
    void setUp() {
        userStatsService = new UserStatsService(userStatsRepository, userRepository);
        trustScoreService = new TrustScoreService(userStatsService);
    }

    @Test
    void recordSettlementCompleted_increasesTrustAndSuccessRate() {
        User user = User.builder().id(1L).email("a@test.com").fullName("A").build();
        UserStats stats = UserStats.builder().user(user).userId(1L).build();

        when(userStatsRepository.findById(1L)).thenReturn(Optional.of(stats));

        trustScoreService.recordSettlementCompleted(1L, true);
        trustScoreService.recordSettlementCompleted(1L, true);

        assertEquals(2, stats.getTotalSettlements());
        assertEquals(2, stats.getOnTimeSettlements());
        assertTrue(stats.getTrustScore().compareTo(BigDecimal.valueOf(50)) > 0);
        assertEquals(0, stats.getSettlementSuccessRate().compareTo(BigDecimal.valueOf(100)));
    }
}
