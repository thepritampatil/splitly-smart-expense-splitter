package com.splitly.service;

import com.splitly.dto.*;
import com.splitly.exception.*;
import com.splitly.model.*;
import com.splitly.repository.*;
import com.splitly.gamification.GamificationEvents;
import com.splitly.gamification.event.DomainEventPublisher;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final ActivityService activityService;
    private final AuthUtil authUtil;
    private final DomainEventPublisher domainEventPublisher;

    public List<GroupDto> getMyGroups() {
        User current = authUtil.getCurrentUser();
        return groupRepository.findGroupsByUserId(current.getId(), MemberStatus.ACCEPTED)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public GroupDto getGroupById(Long groupId) {
        User current = authUtil.getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", groupId));

        // Verify user is a member
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, current.getId(), MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("You are not a member of this group");
        }
        return toDto(group);
    }

    @Transactional
    public GroupDto createGroup(CreateGroupRequest request) {
        User creator = authUtil.getCurrentUser();

        Group group = Group.builder()
                .groupName(request.groupName)
                .description(request.description)
                .type(request.type)
                .avatar(request.avatar != null ? request.avatar : generateGroupEmoji(request.type))
                .createdBy(creator)
                .build();

        group = groupRepository.save(group);

        // Add creator as ADMIN
        GroupMember adminMember = GroupMember.builder()
                .group(group)
                .user(creator)
                .role(MemberRole.ADMIN)
                .status(MemberStatus.ACCEPTED)
                .build();
        memberRepository.save(adminMember);

        // Invite other members by email
        if (request.memberEmails != null) {
            final Group savedGroup = group;
            for (String email : request.memberEmails) {
                inviteMemberByEmail(savedGroup, email, creator);
            }
        }

        activityService.log(ActivityType.GROUP_CREATED, group,
                creator.getFullName() + " created group \"" + group.getGroupName() + "\"", creator);

        return toDto(group);
    }

    @Transactional
    public GroupDto updateGroup(Long groupId, UpdateGroupRequest request) {
        User current = authUtil.getCurrentUser();
        Group group = getGroupAndVerifyAdmin(groupId, current.getId());

        if (request.groupName != null) group.setGroupName(request.groupName);
        if (request.description != null) group.setDescription(request.description);
        if (request.type != null) group.setType(request.type);
        if (request.avatar != null) group.setAvatar(request.avatar);

        activityService.log(ActivityType.GROUP_UPDATED, group,
                current.getFullName() + " updated group settings", current);

        return toDto(groupRepository.save(group));
    }

    @Transactional
    public void archiveGroup(Long groupId) {
        User current = authUtil.getCurrentUser();
        Group group = getGroupAndVerifyAdmin(groupId, current.getId());
        group.setArchived(true);
        groupRepository.save(group);
    }

    @Transactional
    public void inviteMember(Long groupId, InviteMemberRequest request) {
        User current = authUtil.getCurrentUser();
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", groupId));
        verifyAdmin(groupId, current.getId());
        inviteMemberByEmail(group, request.email, current);
    }

    @Transactional
    public void acceptInvite(Long groupId) {
        User current = authUtil.getCurrentUser();
        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, current.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Invitation not found"));

        if (member.getStatus() != MemberStatus.PENDING) {
            throw new BadRequestException("Invitation already processed");
        }

        member.setStatus(MemberStatus.ACCEPTED);
        memberRepository.save(member);

        Group group = groupRepository.findById(groupId).orElseThrow();

        // Auto-add to friend list: add bidirectional friendship with all group members
        autoAddFriends(current, groupId);

        activityService.log(ActivityType.USER_JOINED_GROUP, group,
                current.getFullName() + " joined the group", current);

        domainEventPublisher.publishGamificationEvent(
                GamificationEvents.groupMemberJoined(current.getId(), groupId));
    }

    @Transactional
    public void removeMember(Long groupId, Long userId) {
        User current = authUtil.getCurrentUser();
        verifyAdmin(groupId, current.getId());

        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found in group"));

        Group group = groupRepository.findById(groupId).orElseThrow();
        activityService.log(ActivityType.MEMBER_REMOVED, group,
                current.getFullName() + " removed a member from the group", current);

        memberRepository.delete(member);
    }

    // ---- PRIVATE HELPERS ----

    private void inviteMemberByEmail(Group group, String email, User invitedBy) {
        User invitee = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (memberRepository.existsByGroupIdAndUserIdAndStatus(group.getId(), invitee.getId(), MemberStatus.ACCEPTED)) {
            return; // already a member, skip
        }

        boolean alreadyInvited = memberRepository.findByGroupIdAndUserId(group.getId(), invitee.getId()).isPresent();
        if (alreadyInvited) return;

        GroupMember member = GroupMember.builder()
                .group(group)
                .user(invitee)
                .role(MemberRole.MEMBER)
                .status(MemberStatus.PENDING)
                .invitedBy(invitedBy)
                .build();
        memberRepository.save(member);

        activityService.log(ActivityType.MEMBER_INVITED, group,
                invitedBy.getFullName() + " invited " + invitee.getFullName() + " to join", invitedBy);
    }

    private void autoAddFriends(User user, Long groupId) {
        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(groupId, MemberStatus.ACCEPTED);
        for (GroupMember m : members) {
            if (!m.getUser().getId().equals(user.getId())) {
                addFriendIfNotExists(user, m.getUser());
                addFriendIfNotExists(m.getUser(), user);
            }
        }
    }

    private void addFriendIfNotExists(User user, User friend) {
        if (!friendRepository.existsByUserIdAndFriendId(user.getId(), friend.getId())) {
            friendRepository.save(Friend.builder().user(user).friend(friend).build());
        }
    }

    private Group getGroupAndVerifyAdmin(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", groupId));
        verifyAdmin(groupId, userId);
        return group;
    }

    private void verifyAdmin(Long groupId, Long userId) {
        GroupMember member = memberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new UnauthorizedException("Not a group member"));
        if (member.getRole() != MemberRole.ADMIN) {
            throw new UnauthorizedException("Only group admins can perform this action");
        }
    }

    private GroupDto toDto(Group group) {
        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(group.getId(), MemberStatus.ACCEPTED);
        List<GroupMemberDto> memberDtos = members.stream().map(GroupMemberDto::from).collect(Collectors.toList());

        BigDecimal totalExpenses = group.getExpenses().stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return GroupDto.from(group, totalExpenses, memberDtos);
    }

    private String generateGroupEmoji(GroupType type) {
        return switch (type) {
            case HOSTEL -> "🏠";
            case TRIP -> "🏖️";
            case FLATMATES -> "🛏️";
            case COLLEGE -> "🎓";
            case OFFICE -> "💼";
            default -> "👥";
        };
    }
}
