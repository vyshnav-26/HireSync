package com.hiresync.service;

import com.hiresync.config.CustomUserDetails;
import com.hiresync.dto.AuthRequest;
import com.hiresync.dto.AuthResponse;
import com.hiresync.dto.RegisterRequest;
import com.hiresync.entity.Profile;
import com.hiresync.entity.User;
import com.hiresync.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();
        
        Profile profile = Profile.builder()
                .fullName(request.getFullName())
                .user(user)
                .build();
        user.setProfile(profile);

        userRepository.save(user);

        var jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserDto(user))
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(new CustomUserDetails(user));
        return AuthResponse.builder()
                .token(jwtToken)
                .user(mapToUserDto(user))
                .build();
    }

    private AuthResponse.UserDto mapToUserDto(User user) {
        return AuthResponse.UserDto.builder()
                .id(user.getId() != null ? user.getId().toString() : "0")
                .email(user.getEmail())
                .name(user.getProfile() != null ? user.getProfile().getFullName() : "")
                .userType(user.getRole().name().equals("JOB_SEEKER") ? "candidate" : "recruiter")
                .createdAt(java.time.Instant.now().toString())
                .build();
    }
}
