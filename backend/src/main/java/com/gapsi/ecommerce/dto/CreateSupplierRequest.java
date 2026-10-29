package com.gapsi.ecommerce.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierRequest {

    @NotBlank(message = "El nombre es obligatorio.")
    @Pattern(regexp = "(?sU).*\\S.*", message = "El nombre es obligatorio.")
    @Size(max = 255, message = "El nombre no debe superar 255 caracteres.")
    private String nombre;

    @NotBlank(message = "La razón social es obligatoria.")
    @Pattern(regexp = "(?sU).*\\S.*", message = "La razón social es obligatoria.")
    @Size(max = 255, message = "La razón social no debe superar 255 caracteres.")
    private String razonSocial;

    @NotBlank(message = "La dirección es obligatoria.")
    @Pattern(regexp = "(?sU).*\\S.*", message = "La dirección es obligatoria.")
    @Size(max = 500, message = "La dirección no debe superar 500 caracteres.")
    private String direccion;
}
