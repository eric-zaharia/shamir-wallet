package com.licenta.backend.service;

import com.licenta.backend.client.EncryptionKeyClient;
import com.licenta.backend.entity.Password;
import com.licenta.backend.entity.Shard;
import com.licenta.backend.entity.User;
import com.licenta.backend.model.EncryptionKey;
import com.licenta.backend.model.PasswordRequest;
import com.licenta.backend.repository.PasswordRepository;
import com.licenta.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PasswordService {
    private final PasswordRepository passwordRepository;
    private final EncryptionKeyClient encryptionKeyClient;
    private final UserRepository userRepository;

    private final String mockKey = "abcdefgh";

    public void addPassword(PasswordRequest passwordRequest) {
        Password password = new Password();
        List<Shard> shards = new ArrayList<>();

        for (String s : passwordRequest.getShards()) {
            Shard shard = new Shard();
            shard.setShard(s);
            shard.setPassword(password);
            shards.add(shard);
        }

        password.setShards(shards);
        password.setShardsNo(passwordRequest.getShardsNo());
        password.setSelfCustodyShardsNo(passwordRequest.getSelfCustodyShardsNo());

        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        password.setUser(user);

        passwordRepository.save(password);

        encryptionKeyClient.save(new EncryptionKey(mockKey, password.getId()));
    }

}
