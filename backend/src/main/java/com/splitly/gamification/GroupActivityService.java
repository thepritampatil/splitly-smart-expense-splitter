package com.splitly.gamification;

import com.splitly.dto.GroupActivityPointDto;
import com.splitly.dto.GroupInsightsDto;
import com.splitly.model.Group;
import com.splitly.model.GroupActivityStats;
import com.splitly.model.MemberStatus;
import com.splitly.repository.GroupActivityStatsRepository;
import com.splitly.repository.GroupMemberRepository;
import com.splitly.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupActivityService {

    private final GroupActivityStatsRepository activityStatsRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;

    @Transactional
    public void recordExpense(Long groupId) {
        bump(groupId, true, false);
    }

    @Transactional
    public void recordSettlement(Long groupId) {
        bump(groupId, false, true);
    }

    private void bump(Long groupId, boolean expense, boolean settlement) {
        LocalDate day = LocalDate.now();
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) return;

        GroupActivityStats stats = activityStatsRepository.findByGroupIdAndDayBucket(groupId, day)
                .orElseGet(() -> GroupActivityStats.builder()
                        .group(group)
                        .dayBucket(day)
                        .build());

        if (expense) {
            stats.setExpenseCount(stats.getExpenseCount() + 1);
        }
        if (settlement) {
            stats.setSettlementCount(stats.getSettlementCount() + 1);
        }
        stats.setActiveParticipants(Math.min(
                stats.getExpenseCount() + stats.getSettlementCount(),
                memberRepository.findByGroupIdAndStatus(groupId, MemberStatus.ACCEPTED).size()
        ));
        stats.setActivityScore(BigDecimal.valueOf(
                stats.getExpenseCount() * 2.0 + stats.getSettlementCount() * 3.0 + stats.getActiveParticipants()
        ));
        activityStatsRepository.save(stats);
    }

    public List<GroupActivityPointDto> getHeatmap(Long groupId, int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(days - 1L);
        return activityStatsRepository.findByGroupIdAndDayBucketBetweenOrderByDayBucketAsc(groupId, from, to)
                .stream()
                .map(s -> GroupActivityPointDto.builder()
                        .day(s.getDayBucket())
                        .expenseCount(s.getExpenseCount())
                        .settlementCount(s.getSettlementCount())
                        .activeParticipants(s.getActiveParticipants())
                        .activityScore(s.getActivityScore())
                        .build())
                .toList();
    }

    public GroupInsightsDto getInsights(Long groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        String groupName = group != null ? group.getGroupName() : "Group";
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(6);
        List<GroupActivityStats> week = activityStatsRepository
                .findByGroupIdAndDayBucketBetweenOrderByDayBucketAsc(groupId, from, to);

        int weeklyExpenses = week.stream().mapToInt(GroupActivityStats::getExpenseCount).sum();
        int weeklySettlements = week.stream().mapToInt(GroupActivityStats::getSettlementCount).sum();
        int activeMembers = week.stream().mapToInt(GroupActivityStats::getActiveParticipants).max().orElse(0);

        String headline;
        if (weeklySettlements >= 5) {
            headline = groupName + " completed " + weeklySettlements + " settlements this week";
        } else if (weeklyExpenses >= 3) {
            headline = groupName + " is highly active today";
        } else {
            headline = "Keep the momentum going in " + groupName;
        }

        return GroupInsightsDto.builder()
                .headline(headline)
                .weeklyExpenses(weeklyExpenses)
                .weeklySettlements(weeklySettlements)
                .activeMembers(activeMembers)
                .heatmap(getHeatmap(groupId, 7))
                .build();
    }
}
