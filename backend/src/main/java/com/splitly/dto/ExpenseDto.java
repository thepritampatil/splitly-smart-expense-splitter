package com.splitly.dto;

import com.splitly.model.Expense;
import com.splitly.model.ExpenseCategory;
import com.splitly.model.SplitType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDto {
    public Long id;
    public BigDecimal amount;
    public String description;
    public ExpenseCategory category;
    public SplitType splitType;
    public UserDto paidBy;
    public Long groupId;
    public String groupName;
    public LocalDateTime createdAt;
    public List<ExpenseParticipantDto> participants;

    public static ExpenseDto from(Expense expense, List<ExpenseParticipantDto> participants) {
        return ExpenseDto.builder()
                .id(expense.getId())
                .amount(expense.getAmount())
                .description(expense.getDescription())
                .category(expense.getCategory())
                .splitType(expense.getSplitType())
                .paidBy(UserDto.from(expense.getPaidBy()))
                .groupId(expense.getGroup().getId())
                .groupName(expense.getGroup().getGroupName())
                .createdAt(expense.getCreatedAt())
                .participants(participants)
                .build();
    }
}
