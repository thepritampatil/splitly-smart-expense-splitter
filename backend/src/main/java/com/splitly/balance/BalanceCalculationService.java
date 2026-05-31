package com.splitly.balance;

import com.splitly.dto.BalanceDto;
import com.splitly.exception.UnauthorizedException;
import com.splitly.model.*;
import com.splitly.repository.ExpenseRepository;
import com.splitly.repository.GroupMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BalanceCalculationService {

    private final ExpenseRepository expenseRepository;
    private final GroupMemberRepository memberRepository;

    /**
     * Net balance per member: totalPaid - totalOwed.
     * Positive = should receive money; negative = owes money.
     */
    public List<BalanceDto> calculateGroupBalances(Long groupId) {
        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(groupId, MemberStatus.ACCEPTED);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            User user = m.getUser();

            BigDecimal totalPaid = expenses.stream()
                    .filter(e -> e.getPaidBy().getId().equals(user.getId()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalOwed = expenses.stream()
                    .flatMap(e -> e.getParticipants().stream())
                    .filter(p -> p.getUser().getId().equals(user.getId()))
                    .map(ExpenseParticipant::getShareAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal netBalance = totalPaid.subtract(totalOwed);

            return BalanceDto.builder()
                    .userId(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .totalPaid(totalPaid)
                    .totalOwed(totalOwed)
                    .netBalance(netBalance)
                    .build();
        }).collect(Collectors.toList());
    }

    public void verifyMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("You are not a member of this group");
        }
    }
}
