package com.licenta.backend.mapper;

import com.licenta.backend.dto.RegisterRequest;
import com.licenta.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface RegisterUserMapper {
    RegisterUserMapper INSTANCE = Mappers.getMapper(RegisterUserMapper.class);

    RegisterRequest toDto(User user);

    User toEntity(RegisterRequest registerRequest);
}
