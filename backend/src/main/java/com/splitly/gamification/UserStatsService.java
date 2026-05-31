package com.splitly.gamification;

import com.splitly.model.User;
import com.splitly.model.UserStats;
import com.splitly.repository.UserRepository;
import com.splitly.repository.UserStatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserStatsService {

    private final UserStatsRepository userStatsRepository;
    private final UserRepository userRepository;

    @Transactional
    public UserStats getOrCreate(Long userId) {
        return userStatsRepository.findById(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            UserStats stats = UserStats.builder()
                    .user(user)
                    .lastCalculatedAt(LocalDateTime.now())
                    .build();
            return userStatsRepository.save(stats);
        });
    }
}
