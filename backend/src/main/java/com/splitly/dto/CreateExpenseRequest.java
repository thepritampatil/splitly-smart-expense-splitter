package com.splitly.dto;

import com.splitly.model.ExpenseCategory;
import com.splitly.model.SplitType;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    public BigDecimal amount;

    @NotBlank(message = "Description is required")
    public String description;

    @NotNull(message = "Category is required")
    public ExpenseCategory category;

    @NotNull(message = "Split type is required")
    public SplitType splitType;

    @NotNull(message = "Group is required")
    public Long groupId;

    @NotEmpty(message = "At least one participant is required")
    public List<ParticipantDto> participants;
}
