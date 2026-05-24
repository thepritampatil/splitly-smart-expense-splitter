package com.splitly.service;

import com.splitly.dto.*;
import com.splitly.exception.BadRequestException;
import com.splitly.model.User;
import com.splitly.repository.UserRepository;
import com.splitly.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authManager;
    private final UserDetailsService userDetailsService;

    private static final List<String> AVATARS = List.of(
        "https://api.dicebear.com/7.x/avataaars/svg?seed=",
        "https://api.dicebear.com/7.x/bottts/svg?seed=",
        "https://api.dicebear.com/7.x/identicon/svg?seed="
    );

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email)) {
            throw new BadRequestException("Email already registered. Please login.");
        }

        String avatar = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + request.email;

        User user = User.builder()
                .fullName(request.fullName)
                .email(request.email.toLowerCase().trim())
                .password(passwordEncoder.encode(request.password))
                .avatar(avatar)
                .build();

        user = userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .user(UserDto.from(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email.toLowerCase().trim(),
                        request.password
                )
        );

        User user = userRepository.findByEmail(request.email.toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(token)
                .user(UserDto.from(user))
                .build();
    }
}
