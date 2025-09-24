package com.licenta.backend.repository;

import com.licenta.backend.entity.Password;
import com.licenta.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PasswordRepository extends JpaRepository<Password, Long> {
    List<Password> findAllByUser(User user);
}
