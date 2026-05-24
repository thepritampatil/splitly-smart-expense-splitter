package com.splitly.controller;

import com.splitly.dto.CreateMessageRequest;
import com.splitly.dto.MessageDto;
import com.splitly.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<MessageDto>> getGroupMessages(@PathVariable Long groupId) {
        return ResponseEntity.ok(messageService.getGroupMessages(groupId));
    }

    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(@Valid @RequestBody CreateMessageRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(req));
    }
}
