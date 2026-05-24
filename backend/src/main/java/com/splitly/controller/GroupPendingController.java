package com.splitly.controller;

import com.splitly.dto.GroupDto;
import com.splitly.model.MemberStatus;
import com.splitly.repository.GroupRepository;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Supplementary group endpoints not in the main Controllers.java
 */
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupPendingController {

    private final GroupRepository groupRepository;
    private final AuthUtil authUtil;

    /**
     * Returns groups where the current user has a PENDING invite
     */
    @GetMapping("/pending")
    public ResponseEntity<List<GroupDto>> getPendingInvites() {
        var current = authUtil.getCurrentUser();
        var pendingGroups = groupRepository.findAllGroupsByUserId(current.getId(), MemberStatus.PENDING);

        List<GroupDto> dtos = pendingGroups.stream()
                .map(g -> GroupDto.from(g, BigDecimal.ZERO, List.of()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }
}
