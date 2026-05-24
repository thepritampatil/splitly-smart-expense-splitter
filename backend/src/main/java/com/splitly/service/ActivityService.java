package com.splitly.service;

import com.splitly.dto.ActivityDto;
import com.splitly.model.*;
import com.splitly.repository.ActivityRepository;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final AuthUtil authUtil;

    public void log(ActivityType type, Group group, String message, User triggeredBy) {
        Activity activity = Activity.builder()
                .type(type)
                .group(group)
                .message(message)
                .triggeredBy(triggeredBy)
                .build();
        activityRepository.save(activity);
    }

    public List<ActivityDto> getGroupActivities(Long groupId) {
        return activityRepository.findByGroupId(groupId)
                .stream().map(ActivityDto::from).collect(Collectors.toList());
    }

    public List<ActivityDto> getMyActivities() {
        User current = authUtil.getCurrentUser();
        return activityRepository.findAllActivitiesForUser(current.getId())
                .stream().map(ActivityDto::from).collect(Collectors.toList());
    }
}
