package com.gapsi.ecommerce.config;

import java.util.ArrayList;
import java.util.List;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "gapsi.cors")
@Validated
@Getter
@Setter
public class CorsProperties {

    @NotEmpty
    private List<@NotBlank String> allowedOrigins = new ArrayList<>();
}
