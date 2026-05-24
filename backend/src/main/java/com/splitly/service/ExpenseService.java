package com.splitly.service;

import com.splitly.dto.*;
import com.splitly.exception.*;
import com.splitly.model.*;
import com.splitly.repository.*;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final AuthUtil authUtil;

    public List<ExpenseDto> getGroupExpenses(Long groupId) {
        User current = authUtil.getCurrentUser();
        verifyMember(groupId, current.getId());
        return expenseRepository.findByGroupId(groupId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDto createExpense(CreateExpenseRequest req) {
        User current = authUtil.getCurrentUser();
        Group group = groupRepository.findById(req.groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", req.groupId));

        verifyMember(req.groupId, current.getId());

        // Validate split amounts
        if (req.splitType == SplitType.EXACT) {
            BigDecimal total = req.participants.stream()
                    .map(p -> p.shareAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (total.compareTo(req.amount) != 0) {
                throw new BadRequestException(
                    "Exact split amounts (" + total + ") must equal total expense (" + req.amount + ")"
                );
            }
        }

        Expense expense = Expense.builder()
                .amount(req.amount)
                .description(req.description)
                .category(req.category)
                .splitType(req.splitType)
                .paidBy(current)
                .group(group)
                .build();

        expense = expenseRepository.save(expense);

        // Build participants
        List<ExpenseParticipant> participants = buildParticipants(expense, req);
        expense.setParticipants(participants);
        expenseRepository.save(expense);

        activityService.log(
            ActivityType.EXPENSE_ADDED, group,
            current.getFullName() + " added \"" + req.description + "\" ₹" + req.amount, current
        );

        log.info("Expense created: {} for group {}", expense.getId(), group.getId());
        return toDto(expense);
    }

    @Transactional
    public ExpenseDto updateExpense(Long expenseId, CreateExpenseRequest req) {
        User current = authUtil.getCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        if (!expense.getPaidBy().getId().equals(current.getId())) {
            throw new UnauthorizedException("Only the payer can edit this expense");
        }

        if (req.splitType == SplitType.EXACT) {
            BigDecimal total = req.participants.stream()
                    .map(p -> p.shareAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            if (total.compareTo(req.amount) != 0) {
                throw new BadRequestException("Exact split amounts must equal total expense");
            }
        }

        expense.setAmount(req.amount);
        expense.setDescription(req.description);
        expense.setCategory(req.category);
        expense.setSplitType(req.splitType);
        expense.getParticipants().clear();

        List<ExpenseParticipant> participants = buildParticipants(expense, req);
        expense.getParticipants().addAll(participants);
        expense = expenseRepository.save(expense);

        activityService.log(
            ActivityType.EXPENSE_UPDATED, expense.getGroup(),
            current.getFullName() + " updated expense \"" + req.description + "\"", current
        );

        return toDto(expense);
    }

    @Transactional
    public void deleteExpense(Long expenseId) {
        User current = authUtil.getCurrentUser();
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", expenseId));

        if (!expense.getPaidBy().getId().equals(current.getId())) {
            // Allow group admin too
            boolean isAdmin = memberRepository.findByGroupIdAndUserId(
                expense.getGroup().getId(), current.getId()
            ).map(m -> m.getRole() == MemberRole.ADMIN).orElse(false);

            if (!isAdmin) throw new UnauthorizedException("Not authorized to delete this expense");
        }

        activityService.log(
            ActivityType.EXPENSE_DELETED, expense.getGroup(),
            current.getFullName() + " deleted expense \"" + expense.getDescription() + "\"", current
        );

        expenseRepository.delete(expense);
    }

    /**
     * Calculate net balance for each member in a group.
     * Balance = totalPaid - totalOwed
     * Positive = should receive money
     * Negative = owes money
     */
    public List<BalanceDto> getGroupBalances(Long groupId) {
        User current = authUtil.getCurrentUser();
        verifyMember(groupId, current.getId());

        List<GroupMember> members = memberRepository.findByGroupIdAndStatus(groupId, MemberStatus.ACCEPTED);
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        return members.stream().map(m -> {
            User user = m.getUser();

            // Total amount this user paid
            BigDecimal totalPaid = expenses.stream()
                    .filter(e -> e.getPaidBy().getId().equals(user.getId()))
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Total amount this user owes (their share in all expenses)
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

    // --- PRIVATE HELPERS ---

    private List<ExpenseParticipant> buildParticipants(Expense expense, CreateExpenseRequest req) {
        List<ExpenseParticipant> participants = new ArrayList<>();
        int count = req.participants.size();

        for (int i = 0; i < count; i++) {
            ParticipantDto p = req.participants.get(i);
            User user = userRepository.findById(p.userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", p.userId));

            BigDecimal share;
            if (req.splitType == SplitType.EQUAL) {
                // Distribute evenly, last person gets remainder to avoid rounding issues
                if (i < count - 1) {
                    share = req.amount.divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN);
                } else {
                    BigDecimal alreadyAllocated = req.amount
                            .divide(BigDecimal.valueOf(count), 2, RoundingMode.DOWN)
                            .multiply(BigDecimal.valueOf(count - 1));
                    share = req.amount.subtract(alreadyAllocated);
                }
            } else {
                share = p.shareAmount;
            }

            participants.add(ExpenseParticipant.builder()
                    .expense(expense)
                    .user(user)
                    .shareAmount(share)
                    .build());
        }
        return participants;
    }

    private ExpenseDto toDto(Expense expense) {
        List<ExpenseParticipantDto> participants = expense.getParticipants().stream()
                .map(p -> ExpenseParticipantDto.builder()
                        .userId(p.getUser().getId())
                        .fullName(p.getUser().getFullName())
                        .email(p.getUser().getEmail())
                        .shareAmount(p.getShareAmount())
                        .build())
                .collect(Collectors.toList());
        return ExpenseDto.from(expense, participants);
    }

    private void verifyMember(Long groupId, Long userId) {
        if (!memberRepository.existsByGroupIdAndUserIdAndStatus(groupId, userId, MemberStatus.ACCEPTED)) {
            throw new UnauthorizedException("You are not a member of this group");
        }
    }
}
