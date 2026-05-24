package com.splitly.dto;

import com.splitly.model.Activity;
import com.splitly.model.ActivityType;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityDto {
    public Long id;
    public ActivityType type;
    public String message;
    public Long groupId;
    public String groupName;
    public UserDto triggeredBy;
    public LocalDateTime timestamp;

    public static ActivityDto from(Activity a) {
        return ActivityDto.builder()
                .id(a.getId())
                .type(a.getType())
                .message(a.getMessage())
                .groupId(a.getGroup() != null ? a.getGroup().getId() : null)
                .groupName(a.getGroup() != null ? a.getGroup().getGroupName() : null)
                .triggeredBy(a.getTriggeredBy() != null ? UserDto.from(a.getTriggeredBy()) : null)
                .timestamp(a.getTimestamp())
                .build();
    }
}
