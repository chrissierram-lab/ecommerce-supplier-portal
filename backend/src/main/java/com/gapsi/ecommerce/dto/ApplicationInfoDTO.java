// PATRÓN DE DISEÑO 1: BUILDER / SINGLETON
// Builder construye una respuesta inmutable desde el mapper singleton de Spring.
package com.gapsi.ecommerce.dto;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ApplicationInfoDTO {

    private final String welcomeMessage;
    private final String version;
    private final String candidateImage;
}
