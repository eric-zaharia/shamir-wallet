package com.licenta.password_store.repository;

import com.licenta.password_store.entity.EncryptionKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EncryptionKeyRepository extends JpaRepository<EncryptionKey, Long> {
    Optional<EncryptionKey> findByPasswordId(long passwordId);
    boolean existsByPasswordId(long passwordId);
}
