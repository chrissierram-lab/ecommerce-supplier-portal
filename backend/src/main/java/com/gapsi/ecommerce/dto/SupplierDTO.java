// PATRÓN DE DISEÑO 1: BUILDER / SINGLETON
// Builder crea el DTO inmutable y el mapper singleton concentra la conversión.
package com.gapsi.ecommerce.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class SupplierDTO {

    private final Long id;
    private final String nombre;
    private final String razonSocial;
    private final String direccion;
    private final LocalDateTime fechaCreacion;
}
