package com.splitly.controller;

import com.splitly.dto.ActivityDto;
import com.splitly.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<ActivityDto>> getMyActivities() {
        return ResponseEntity.ok(activityService.getMyActivities());
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ActivityDto>> getGroupActivities(@PathVariable Long groupId) {
        return ResponseEntity.ok(activityService.getGroupActivities(groupId));
    }
}
