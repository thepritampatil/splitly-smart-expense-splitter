package com.splitly.controller;

import com.splitly.dto.UserDto;
import com.splitly.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserDto>> getFriends() {
        return ResponseEntity.ok(userService.getMyFriends());
    }
}
