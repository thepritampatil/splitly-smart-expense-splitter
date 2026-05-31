package com.splitly.gamification;

import com.splitly.balance.BalanceCalculationService;
import com.splitly.dto.LeaderboardEntryDto;
import com.splitly.model.MemberStatus;
import com.splitly.model.User;
import com.splitly.model.UserStats;
import com.splitly.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final GroupMemberRepository memberRepository;
    private final UserStatsService userStatsService;
    private final BalanceCalculationService balanceCalculationService;

    public List<LeaderboardEntryDto> getGroupLeaderboard(Long groupId, String type, Long requesterId) {
        balanceCalculationService.verifyMember(groupId, requesterId);

        List<Long> memberIds = memberRepository.findByGroupIdAndStatus(groupId, MemberStatus.ACCEPTED)
                .stream()
                .map(m -> m.getUser().getId())
                .toList();

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        for (Long userId : memberIds) {
            UserStats stats = userStatsService.getOrCreate(userId);
            User user = stats.getUser();
            BigDecimal score;
            String label;
            switch (type == null ? "active" : type.toLowerCase()) {
                case "settler" -> {
                    score = BigDecimal.valueOf(stats.getOnTimeSettlements());
                    label = "Fastest settler";
                }
                case "contributor" -> {
                    score = stats.getContributionScore();
                    label = "Top contributor";
                }
                case "reliable" -> {
                    score = stats.getTrustScore();
                    label = "Most reliable";
                }
                default -> {
                    score = BigDecimal.valueOf(stats.getStreakCount() + stats.getTotalSettlements());
                    label = "Most active";
                }
            }
            entries.add(LeaderboardEntryDto.builder()
                    .userId(userId)
                    .fullName(user.getFullName())
                    .avatar(user.getAvatar())
                    .score(score)
                    .label(label)
                    .build());
        }

        entries.sort(Comparator.comparing(LeaderboardEntryDto::getScore).reversed());
        List<LeaderboardEntryDto> ranked = new ArrayList<>();
        int rank = 1;
        for (LeaderboardEntryDto e : entries) {
            ranked.add(LeaderboardEntryDto.builder()
                    .userId(e.getUserId())
                    .fullName(e.getFullName())
                    .avatar(e.getAvatar())
                    .score(e.getScore())
                    .label(e.getLabel())
                    .rank(rank++)
                    .build());
        }
        return ranked.stream().limit(10).toList();
    }
}
