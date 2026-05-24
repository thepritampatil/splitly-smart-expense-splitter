package com.splitly.dto;

import com.splitly.model.GroupType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    @Size(min = 2, max = 100)
    public String groupName;

    public String description;

    @NotNull(message = "Group type is required")
    public GroupType type;

    public String avatar;

    public List<String> memberEmails;
}
