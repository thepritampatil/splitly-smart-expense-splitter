package com.splitly.dto;

import com.splitly.model.GroupType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateGroupRequest {
    public String groupName;
    public String description;
    public GroupType type;
    public String avatar;
}
