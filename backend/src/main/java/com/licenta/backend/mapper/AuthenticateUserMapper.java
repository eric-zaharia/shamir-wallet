package com.licenta.backend.mapper;

import com.licenta.backend.model.AuthenticationRequest;
import com.licenta.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface AuthenticateUserMapper {
    AuthenticateUserMapper INSTANCE = Mappers.getMapper(AuthenticateUserMapper.class);

    AuthenticationRequest toDto(User user);
    User toEntity(AuthenticationRequest authenticationRequest);
}
