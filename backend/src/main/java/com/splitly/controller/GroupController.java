package com.splitly.controller;

import com.splitly.dto.*;
import com.splitly.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupDto>> getMyGroups() {
        return ResponseEntity.ok(groupService.getMyGroups());
    }

    @PostMapping
    public ResponseEntity<GroupDto> createGroup(@Valid @RequestBody CreateGroupRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(groupService.createGroup(req));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDto> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDto> updateGroup(
            @PathVariable Long id, @RequestBody UpdateGroupRequest req) {
        return ResponseEntity.ok(groupService.updateGroup(id, req));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<Void> archiveGroup(@PathVariable Long id) {
        groupService.archiveGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<Void> inviteMember(
            @PathVariable Long id, @Valid @RequestBody InviteMemberRequest req) {
        groupService.inviteMember(id, req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<Void> acceptInvite(@PathVariable Long id) {
        groupService.acceptInvite(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long id, @PathVariable Long userId) {
        groupService.removeMember(id, userId);
        return ResponseEntity.noContent().build();
    }
}
