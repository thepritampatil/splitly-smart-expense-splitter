package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebtDto {
    public Long fromUserId;
    public String fromUserName;
    public Long toUserId;
    public String toUserName;
    public BigDecimal amount;
}
