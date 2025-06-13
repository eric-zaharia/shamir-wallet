package com.licenta.backend.service;

import com.licenta.backend.dto.*;
import com.licenta.backend.mapper.RegisterUserMapper;
import com.licenta.backend.entity.User;
import com.licenta.backend.repository.UserRepository;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MailService mailService;

    @Value("${client.base.url}" + ":" + "${client.port}" + "/" + "${client.reset-password}")
    private String resetPasswordUrl;

    public void resetPassword(ResetPasswordDto resetPasswordDto) throws Exception {
        if (userRepository.findByEmail(resetPasswordDto.getEmail()).isEmpty()) {
            throw new UsernameNotFoundException(resetPasswordDto.getEmail());
        }

        User user = userRepository.findByEmail(resetPasswordDto.getEmail()).get();

        LocalDateTime now = LocalDateTime.now();

        if (user.getResetToken() == null
                || !user.getResetToken().equals(resetPasswordDto.getResetToken())
                || user.getResetTokenExp() == null
                || user.getResetTokenExp().isBefore(now)) {
            throw new Exception(resetPasswordDto.getEmail());
        }

        user.setPassword(passwordEncoder.encode(resetPasswordDto.getPassword()));
        user.setResetToken(null);
        user.setResetTokenExp(null);
        userRepository.save(user);
    }

    public void forgotPassword(ForgotPasswordDto forgotPasswordDto) {
        if (userRepository.findByEmail(forgotPasswordDto.getEmail()).isEmpty()) {
            throw new UsernameNotFoundException(forgotPasswordDto.getEmail());
        }

        User user = userRepository.findByEmail(forgotPasswordDto.getEmail()).get();
        user.setResetToken(UUID.randomUUID().toString());
        user.setResetTokenExp(LocalDateTime.now().plusMinutes(30));
        userRepository.save(user);

        mailService.sendSimpleMail(
                new MailDetails(
                        user.getEmail(),
                        "Reset Password",
                        resetPasswordUrl + "?token=" + user.getResetToken()
                )
        );
    }

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
