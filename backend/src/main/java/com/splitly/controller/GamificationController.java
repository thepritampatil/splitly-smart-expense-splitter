package com.splitly.controller;

import com.splitly.dto.*;
import com.splitly.gamification.GamificationQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationQueryService gamificationQueryService;

    @GetMapping("/me/summary")
    public ResponseEntity<GamificationSummaryDto> getMySummary() {
        return ResponseEntity.ok(gamificationQueryService.getMySummary());
    }

    @GetMapping("/me/badges")
    public ResponseEntity<List<BadgeDto>> getMyBadges() {
        return ResponseEntity.ok(gamificationQueryService.getMyBadges());
    }

    @GetMapping("/me/stats")
    public ResponseEntity<UserStatsDto> getMyStats() {
        return ResponseEntity.ok(gamificationQueryService.getMyStats());
    }

    @GetMapping("/group/{groupId}/activity")
    public ResponseEntity<List<GroupActivityPointDto>> getGroupActivity(@PathVariable Long groupId) {
        return ResponseEntity.ok(gamificationQueryService.getGroupHeatmap(groupId));
    }

    @GetMapping("/group/{groupId}/insights")
    public ResponseEntity<GroupInsightsDto> getGroupInsights(@PathVariable Long groupId) {
        return ResponseEntity.ok(gamificationQueryService.getGroupInsights(groupId));
    }

    @GetMapping("/group/{groupId}/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDto>> getLeaderboard(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "active") String type) {
        return ResponseEntity.ok(gamificationQueryService.getGroupLeaderboard(groupId, type));
    }
}
