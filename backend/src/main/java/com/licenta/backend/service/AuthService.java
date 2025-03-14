package com.licenta.backend.service;

import com.licenta.backend.Mapper.RegisterUserMapper;
import com.licenta.backend.dto.RegisterRequest;
import com.licenta.backend.entity.User;
import com.licenta.backend.repository.UserRepository;
import jakarta.persistence.EntityExistsException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;

    public void register(RegisterRequest registerRequest) {
        User user = RegisterUserMapper.INSTANCE.toEntity(registerRequest);

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new EntityExistsException(user.getUsername());
        }

        userRepository.save(user);
    }
}
