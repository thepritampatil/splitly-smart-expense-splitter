package com.splitly.gamification;

import com.splitly.dto.*;
import com.splitly.balance.BalanceCalculationService;
import com.splitly.repository.UserBadgeRepository;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GamificationQueryService {

    private final UserStatsService userStatsService;
    private final UserBadgeRepository userBadgeRepository;
    private final GroupActivityService groupActivityService;
    private final LeaderboardService leaderboardService;
    private final BalanceCalculationService balanceCalculationService;
    private final AuthUtil authUtil;

    private void verifyGroupMember(Long groupId) {
        balanceCalculationService.verifyMember(groupId, authUtil.getCurrentUserId());
    }

    public GamificationSummaryDto getMySummary() {
        Long userId = authUtil.getCurrentUserId();
        var stats = userStatsService.getOrCreate(userId);
        var badges = userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId, PageRequest.of(0, 6))
                .stream()
                .map(BadgeDto::from)
                .toList();
        return GamificationSummaryDto.builder()
                .stats(UserStatsDto.from(stats))
                .recentBadges(badges)
                .build();
    }

    public List<BadgeDto> getMyBadges() {
        Long userId = authUtil.getCurrentUserId();
        return userBadgeRepository.findByUserIdOrderByEarnedAtDesc(userId)
                .stream()
                .map(BadgeDto::from)
                .toList();
    }

    public UserStatsDto getMyStats() {
        return UserStatsDto.from(userStatsService.getOrCreate(authUtil.getCurrentUserId()));
    }

    public GroupInsightsDto getGroupInsights(Long groupId) {
        verifyGroupMember(groupId);
        return groupActivityService.getInsights(groupId);
    }

    public List<GroupActivityPointDto> getGroupHeatmap(Long groupId) {
        verifyGroupMember(groupId);
        return groupActivityService.getHeatmap(groupId, 7);
    }

    public List<LeaderboardEntryDto> getGroupLeaderboard(Long groupId, String type) {
        return leaderboardService.getGroupLeaderboard(groupId, type, authUtil.getCurrentUserId());
    }
}
