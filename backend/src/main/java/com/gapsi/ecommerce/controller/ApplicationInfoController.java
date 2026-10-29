package com.gapsi.ecommerce.controller;

import com.gapsi.ecommerce.dto.ApplicationInfoDTO;
import com.gapsi.ecommerce.mapping.ApplicationMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Información")
public class ApplicationInfoController {

    private final ApplicationMapper mapper;

    @GetMapping("/info")
    @Operation(summary = "Consultar el mensaje de bienvenida y la versión")
    public ApplicationInfoDTO info() {
        return mapper.applicationInfo();
    }
}
