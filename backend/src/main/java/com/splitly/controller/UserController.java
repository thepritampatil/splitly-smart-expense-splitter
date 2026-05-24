package com.splitly.controller;

import com.splitly.dto.UpdateProfileRequest;
import com.splitly.dto.UserDto;
import com.splitly.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getMe() {
        return ResponseEntity.ok(userService.getMe());
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(userService.updateProfile(req));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> search(@RequestParam String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
}
