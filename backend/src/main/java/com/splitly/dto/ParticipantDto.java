package com.splitly.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDto {
    public Long userId;
    public BigDecimal shareAmount;
    public BigDecimal sharePercentage;
}
