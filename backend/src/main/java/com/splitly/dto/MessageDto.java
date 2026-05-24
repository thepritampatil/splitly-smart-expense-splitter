package com.splitly.dto;

import com.splitly.model.Message;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDto {
    public Long id;
    public UserDto sender;
    public String content;
    public Long groupId;
    public LocalDateTime createdAt;

    public static MessageDto from(Message m) {
        return MessageDto.builder()
                .id(m.getId())
                .sender(UserDto.from(m.getSender()))
                .content(m.getContent())
                .groupId(m.getGroup().getId())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
