package com.licenta.backend.service;

import com.licenta.backend.model.AuthenticationRequest;
import com.licenta.backend.model.TokenDto;
import com.licenta.backend.mapper.RegisterUserMapper;
import com.licenta.backend.model.RegisterRequest;
import com.licenta.backend.entity.User;
import com.licenta.backend.repository.UserRepository;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public void register(RegisterRequest registerRequest) {
        User user = RegisterUserMapper.INSTANCE.toEntity(registerRequest);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        if (userRepository.existsByUsername(user.getUsername())
                || userRepository.existsByEmail(user.getEmail())
                || userRepository.existsByPhone(user.getPhone())) {
            throw new EntityExistsException(user.getUsername());
        }

        userRepository.save(user);
    }

    public TokenDto authenticate(AuthenticationRequest authenticationRequest) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticationRequest.getEmail(),
                        authenticationRequest.getPassword()
                )
        );

        User user = userRepository.findByEmail(authenticationRequest.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException(authenticationRequest.getEmail()));

        String token = jwtService.generateAccessToken(user);

        return new TokenDto(token);
    }
}
