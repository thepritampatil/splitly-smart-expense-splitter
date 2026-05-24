package com.splitly.repository;

import com.splitly.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByGroupIdOrderByCreatedAtAsc(Long groupId);
}
