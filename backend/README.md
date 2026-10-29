# e-Commerce Gapsi: backend

API REST y GraphQL para administrar proveedores, desarrollada con Spring Boot
2.7.18. El backend exige Java 11 para compilarse y ejecutarse.

## Requisitos y ejecución

- JDK 11 y Maven 3.6.3 o posterior. Un JRE no es suficiente para compilar.
- Configura `JAVA_HOME` para que apunte al JDK 11 y antepone su directorio
  `bin` a `PATH`. Por ejemplo, sustituye la ruta por la de tu instalación:

```bash
export JAVA_HOME=/ruta/al/jdk-11
export PATH="$JAVA_HOME/bin:$PATH"
java -version
mvn -version
```

Ambos comandos deben mostrar Java 11. Maven rechaza otras versiones y el JAR
tampoco inicia con una JVM distinta de Java 11.

Como alternativa, con SDKMAN instalado, el archivo `.sdkmanrc` selecciona
Temurin 11 para este proyecto sin cambiar la versión predeterminada del
sistema. Desde esta carpeta:

```bash
sdk env install  # Primera vez: instala y selecciona el JDK indicado.
sdk env          # En cada nueva terminal, si ya está instalado.
java -version
mvn -version
```

Después, desde esta carpeta:

```bash
mvn clean verify
mvn spring-boot:run
```

La aplicación inicia en `http://localhost:8080` y carga **35 proveedores
ficticios**. La base H2 está en memoria: los cambios desaparecen al detener la
aplicación. Para iniciar sin datos de prueba:

```bash
java -jar target/ecommerce-backend-0.0.1.jar --gapsi.seed.enabled=false
```

El perfil predeterminado es `dev`. Sus herramientas son:

- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- GraphiQL: `http://localhost:8080/graphiql`
- Consola H2: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:gapsidb`
  - Usuario: `sa`; contraseña vacía.

La consola H2 y GraphiQL son herramientas de desarrollo y no deben exponerse en
un entorno de producción.

## Configuración

[`application.yml`](src/main/resources/application.yml) contiene la
configuración de la base de datos, los orígenes CORS,
`gapsi.app.welcome-message`, `gapsi.app.version` y
`gapsi.app.candidate-image`. La propiedad `gapsi.seed.enabled` activa la carga
de los proveedores definidos en
[`DataInitializer.java`](src/main/java/com/gapsi/ecommerce/seed/DataInitializer.java).
[`application-dev.yml`](src/main/resources/application-dev.yml) habilita las
herramientas de desarrollo. Las propiedades se pueden sobrescribir con los
mecanismos de Spring Boot, por ejemplo:

```bash
java -jar target/ecommerce-backend-0.0.1.jar \
  --gapsi.app.welcome-message="Bienvenida personalizada" \
  --gapsi.app.version=1.2.3
```

CORS se aplica a todas las rutas; admite cualquier método y encabezado desde
`http://localhost:3000` y `http://localhost:5173`. La lista de orígenes es
configurable en `gapsi.cors.allowed-origins`.

El valor predeterminado de `candidateImage` es la ruta
`/assets/candidate.png`; la imagen debe proporcionarla el frontend o
incorporarse como recurso estático, ya que el examen no incluye ese archivo.

## API REST

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/api/info` | Mensaje, versión e imagen configurados. |
| GET | `/api/suppliers?page=0&size=10` | `Page<SupplierDTO>`; orden estable por `id` ascendente. |
| POST | `/api/suppliers` | Crea y devuelve el proveedor con HTTP 201. |
| DELETE | `/api/suppliers/{id}` | Elimina el proveedor con HTTP 204. |

Ejemplo de creación:

```bash
curl -X POST http://localhost:8080/api/suppliers \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Proveedor Ejemplo","razonSocial":"Proveedor Ejemplo, S.A. de C.V.","direccion":"Av. Reforma 100, Ciudad de México"}'
```

Los tres campos son obligatorios. `nombre` y `razonSocial` admiten hasta 255
caracteres, y `direccion` hasta 500. Los nombres se normalizan mediante
conversión de mayúsculas y minúsculas con `Locale.ROOT` y se eliminan los
caracteres reconocidos por `Character.isWhitespace` o `Character.isSpaceChar`
de Java. No se eliminan todos los espacios en blanco Unicode ni otros
caracteres invisibles: por ejemplo, `U+0085` y `U+200B` se conservan. La
estrategia los comprueba antes de guardar y una restricción única en la base
protege también contra creaciones simultáneas. Un duplicado devuelve HTTP 409:

```json
{"error":"El proveedor con ese nombre ya existe en la lista."}
```

Las solicitudes inválidas devuelven HTTP 400 y un objeto `error`; eliminar un
identificador inexistente devuelve HTTP 404. La página comienza en 0 y el tamaño
debe ser mayor que 0.

## GraphQL

El endpoint es `POST /graphql`. Las operaciones comparten las mismas
validaciones y datos que REST. `suppliers` acepta `page` y `size` opcionales,
con valores predeterminados 0 y 10; devuelve `content` y metadatos de página.

```graphql
query {
  suppliers(page: 0, size: 10) {
    content { id nombre razonSocial direccion fechaCreacion }
    number
    size
    totalElements
    totalPages
  }
}
```

```graphql
mutation {
  createSupplier(input: {
    nombre: "Proveedor Nuevo"
    razonSocial: "Proveedor Nuevo, S.A. de C.V."
    direccion: "Av. Reforma 100, Ciudad de México"
  }) {
    id
    nombre
  }
}
```

```graphql
mutation {
  deleteSupplier(id: "1")
}
```

Los errores de negocio aparecen en `errors`, con `extensions.code` igual a
`CONFLICT`, `NOT_FOUND` o `BAD_REQUEST`. La respuesta GraphQL utiliza el código
HTTP habitual del protocolo, por lo que también debe revisarse `errors`.

## Patrones y Postman

`ApplicationMapper` es un componente singleton de Spring que utiliza Builder
para construir los DTO inmutables de información y proveedores.
`SupplierValidationStrategy` y `UniqueNameValidationStrategy` aplican Strategy
para desacoplar la regla de unicidad. Ambos patrones están documentados en los
encabezados del código correspondiente.

Importa `Gapsi_Postman_Collection.json` en Postman. Las peticiones de creación
actualizan automáticamente la variable de colección `supplierId`; inicialmente
vale `1`, correspondiente al primer proveedor semilla. `baseUrl` es
configurable. Para probar un duplicado en **REST > Crear proveedor**, reemplaza
`{{$guid}}` por un nombre fijo que no exista y envía la petición dos veces
antes de eliminarlo: la primera responde 201 y la segunda 409. Sin ese cambio,
cada envío genera un nombre distinto.
