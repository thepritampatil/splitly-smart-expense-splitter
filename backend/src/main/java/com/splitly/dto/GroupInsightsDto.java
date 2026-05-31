package com.splitly.dto;

import lombok.Builder;
import lombok.Value;

import java.util.List;

@Value
@Builder
public class GroupInsightsDto {
    String headline;
    Integer weeklySettlements;
    Integer weeklyExpenses;
    Integer activeMembers;
    List<GroupActivityPointDto> heatmap;
}
