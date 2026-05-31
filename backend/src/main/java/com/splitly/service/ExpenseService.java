package com.splitly.service;

import com.splitly.balance.BalanceCalculationService;
import com.splitly.gamification.GamificationEvents;
import com.splitly.gamification.event.DomainEventPublisher;
import com.splitly.dto.*;
import com.splitly.exception.*;
import com.splitly.model.*;
import com.splitly.repository.*;
import com.splitly.split.ComputedShare;
import com.splitly.split.SplitCalculationService;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final SplitCalculationService splitCalculationService;
    private final BalanceCalculationService balanceCalculationService;
    private final DomainEventPublisher domainEventPublisher;

    public List<ExpenseDto> getGroupExpenses(Long groupId) {
        User current = authUtil.getCurrentUser();
        balanceCalculationService.verifyMember(groupId, current.getId());
        return expenseRepository.findByGroupId(groupId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDto createExpense(CreateExpenseRequest req) {
        User current = authUtil.getCurrentUser();
        Group group = groupRepository.findById(req.groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group", req.groupId));

        balanceCalculationService.verifyMember(req.groupId, current.getId());

        Expense expense = Expense.builder()
                .amount(req.amount)
                .description(req.description)
                .category(req.category)
                .splitType(req.splitType)
                .paidBy(current)
                .group(group)
                .build();

        expense = expenseRepository.save(expense);

        List<ExpenseParticipant> participants = buildParticipants(expense, req);
        expense.setParticipants(participants);
        expenseRepository.save(expense);

        activityService.log(
            ActivityType.EXPENSE_ADDED, group,
            current.getFullName() + " added \"" + req.description + "\" ₹" + req.amount, current
        );

        log.info("Expense created: {} for group {}", expense.getId(), group.getId());

        domainEventPublisher.publishGamificationEvent(
                GamificationEvents.expenseCreated(current.getId(), group.getId(), expense.getId(), req.amount));

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
            boolean isAdmin = memberRepository.findByGroupIdAndUserId(
                expense.getGroup().getId(), current.getId()
            ).map(m -> m.getRole() == MemberRole.ADMIN).orElse(false);

            if (!isAdmin) throw new UnauthorizedException("Not authorized to delete this expense");
        }

        activityService.log(
            ActivityType.EXPENSE_DELETED, expense.getGroup(),
            current.getFullName() + " deleted expense \"" + expense.getDescription() + "\"", current
        );

        domainEventPublisher.publishGamificationEvent(
                GamificationEvents.expenseDeleted(current.getId(), expense.getGroup().getId(), expense.getId()));

        expenseRepository.delete(expense);
    }

    public List<BalanceDto> getGroupBalances(Long groupId) {
        User current = authUtil.getCurrentUser();
        balanceCalculationService.verifyMember(groupId, current.getId());
        return balanceCalculationService.calculateGroupBalances(groupId);
    }

    public SplitPreviewResponse previewSplit(CreateExpenseRequest req) {
        User current = authUtil.getCurrentUser();
        balanceCalculationService.verifyMember(req.groupId, current.getId());

        List<ComputedShare> computed = splitCalculationService.calculate(
                req.splitType, req.amount, req.participants);

        var participantDtos = computed.stream()
                .map(s -> ExpenseParticipantDto.builder()
                        .userId(s.getUserId())
                        .shareAmount(s.getShareAmount())
                        .sharePercentage(s.getSharePercentage())
                        .build())
                .toList();

        var allocated = computed.stream()
                .map(ComputedShare::getShareAmount)
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

        return SplitPreviewResponse.builder()
                .valid(true)
                .totalAmount(req.amount)
                .allocatedAmount(allocated)
                .remainingAmount(req.amount.subtract(allocated))
                .participants(participantDtos)
                .build();
    }

    private List<ExpenseParticipant> buildParticipants(Expense expense, CreateExpenseRequest req) {
        List<ComputedShare> shares = splitCalculationService.calculate(
                req.splitType, req.amount, req.participants);

        List<ExpenseParticipant> participants = new ArrayList<>();
        for (ComputedShare share : shares) {
            User user = userRepository.findById(share.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User", share.getUserId()));

            participants.add(ExpenseParticipant.builder()
                    .expense(expense)
                    .user(user)
                    .shareAmount(share.getShareAmount())
                    .sharePercentage(share.getSharePercentage())
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
                        .sharePercentage(p.getSharePercentage())
                        .build())
                .collect(Collectors.toList());
        return ExpenseDto.from(expense, participants);
    }
}
