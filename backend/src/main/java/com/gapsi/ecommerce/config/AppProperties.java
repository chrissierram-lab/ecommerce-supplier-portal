package com.gapsi.ecommerce.config;

import javax.validation.constraints.NotBlank;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;

@Component
@ConfigurationProperties(prefix = "gapsi.app")
@Validated
@Getter
@Setter
public class AppProperties {

    @NotBlank
    private String welcomeMessage;

    @NotBlank
    private String version;

    @NotBlank
    private String candidateImage;
}
