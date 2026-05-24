package com.splitly.dto;

import com.splitly.model.Group;
import com.splitly.model.GroupType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDto {
    public Long id;
    public String groupName;
    public String description;
    public GroupType type;
    public String avatar;
    public UserDto createdBy;
    public Boolean archived;
    public LocalDateTime createdAt;
    public List<GroupMemberDto> members;
    public BigDecimal totalExpenses;

    public static GroupDto from(Group group, BigDecimal totalExpenses, List<GroupMemberDto> members) {
        return GroupDto.builder()
                .id(group.getId())
                .groupName(group.getGroupName())
                .description(group.getDescription())
                .type(group.getType())
                .avatar(group.getAvatar())
                .createdBy(UserDto.from(group.getCreatedBy()))
                .archived(group.getArchived())
                .createdAt(group.getCreatedAt())
                .members(members)
                .totalExpenses(totalExpenses)
                .build();
    }
}
