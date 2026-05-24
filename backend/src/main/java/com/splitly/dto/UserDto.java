package com.splitly.dto;

import com.splitly.model.User;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    public Long id;
    public String fullName;
    public String email;
    public String avatar;
    public LocalDateTime createdAt;

    public static UserDto from(User user) {
        return UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatar(user.getAvatar())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
