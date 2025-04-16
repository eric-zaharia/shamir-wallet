package com.licenta.backend.repository;

import com.licenta.backend.dto.EmailRecipientDto;
import com.licenta.backend.entity.EmailRecipient;
import com.licenta.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmailRecipientRepository extends JpaRepository<EmailRecipient, Long> {

    boolean existsEmailRecipientByUserAndEmail(User user, String email);

    List<EmailRecipientDto> findEmailRecipientByUser(User user);
}
