package com.splitly.dto;

import com.splitly.model.GroupMember;
import com.splitly.model.MemberRole;
import com.splitly.model.MemberStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMemberDto {
    public Long id;
    public UserDto user;
    public MemberRole role;
    public MemberStatus status;
    public LocalDateTime joinedAt;

    public static GroupMemberDto from(GroupMember member) {
        return GroupMemberDto.builder()
                .id(member.getId())
                .user(UserDto.from(member.getUser()))
                .role(member.getRole())
                .status(member.getStatus())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
