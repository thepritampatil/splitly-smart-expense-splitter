package com.splitly.repository;

import com.splitly.model.Friend;
import com.splitly.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {

    @Query("SELECT f FROM Friend f WHERE f.user.id = :userId")
    List<Friend> findFriendsByUserId(Long userId);

    Optional<Friend> findByUserIdAndFriendId(Long userId, Long friendId);

    boolean existsByUserIdAndFriendId(Long userId, Long friendId);
}
