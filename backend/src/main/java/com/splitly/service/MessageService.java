package com.splitly.service;

import com.splitly.dto.CreateMessageRequest;
import com.splitly.dto.MessageDto;
import com.splitly.exception.ResourceNotFoundException;
import com.splitly.exception.UnauthorizedException;
import com.splitly.model.*;
import com.splitly.repository.*;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final AuthUtil authUtil;

    public List<MessageDto> getGroupMessages(Long groupId) {
        User current = authUtil.getCurrentUser();
        verifyMember(groupId, current.getId());
        return messageRepository.findByGroupIdOrderByCreatedAtAsc(groupId)
                .stream().map(MessageDto::from).collect(Collectors.toList());
    }

    @Transactional
    public MessageDto sendMessage(CreateMessageRequest req) {
        User sender = authUtil.getCurrentUser();
        Group group = groupRepository.findById(req.groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", req.groupId));
        verifyMember(req.groupId, sender.getId());

        Message message = Message.builder()
                .group(group)
                .sender(sender)
                .content(req.content)
                .build();

        return MessageDto.from(messageRepository.save(message));
    }

    private void verifyMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("Not a group member");
        }
    }
}
