package com.splitly.service;

import com.splitly.dto.UpdateProfileRequest;
import com.splitly.dto.UserDto;
import com.splitly.model.User;
import com.splitly.repository.FriendRepository;
import com.splitly.repository.UserRepository;
import com.splitly.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final FriendRepository friendRepository;
    private final AuthUtil authUtil;

    public List<UserDto> searchUsers(String query) {
        return userRepository.searchUsers(query)
                .stream().map(UserDto::from).collect(Collectors.toList());
    }

    public List<UserDto> getMyFriends() {
        User current = authUtil.getCurrentUser();
        return friendRepository.findFriendsByUserId(current.getId())
                .stream().map(f -> UserDto.from(f.getFriend()))
                .collect(Collectors.toList());
    }

    public UserDto getMe() {
        return UserDto.from(authUtil.getCurrentUser());
    }

    @Transactional
    public UserDto updateProfile(UpdateProfileRequest req) {
        User user = authUtil.getCurrentUser();
        if (req.fullName != null) user.setFullName(req.fullName);
        if (req.avatar != null) user.setAvatar(req.avatar);
        return UserDto.from(userRepository.save(user));
    }
}
