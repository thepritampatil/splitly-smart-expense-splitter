package com.splitly.dto;

import com.splitly.model.Settlement;
import com.splitly.model.SettlementStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementDto {
    public Long id;
    public UserDto payer;
    public UserDto receiver;
    public BigDecimal amount;
    public SettlementStatus status;
    public Long groupId;
    public String groupName;
    public LocalDateTime createdAt;
    public LocalDateTime settledAt;

    public static SettlementDto from(Settlement s) {
        return SettlementDto.builder()
                .id(s.getId())
                .payer(UserDto.from(s.getPayer()))
                .receiver(UserDto.from(s.getReceiver()))
                .amount(s.getAmount())
                .status(s.getStatus())
                .groupId(s.getGroup().getId())
                .groupName(s.getGroup().getGroupName())
                .createdAt(s.getCreatedAt())
                .settledAt(s.getSettledAt())
                .build();
    }
}
