# e-Commerce Gapsi

Aplicación para consultar y administrar proveedores. Incluye una interfaz web
instalable y un backend con API REST y GraphQL.

## Tecnologías y requisitos

- **Frontend:** React 17, TypeScript, Vite, Redux Toolkit, React Redux 8, Axios,
  Material UI y Emotion. `index.html` incorpora Bootstrap 5 y Font Awesome 6
  desde sus CDN.
- **Backend:** Java 11, Spring Boot 2.7, Spring Data JPA, Spring GraphQL y
  base de datos H2 en memoria.
- **Herramientas:** JDK 11, Maven 3.6.3 o superior, Node.js 24 LTS y npm.
- Un navegador moderno. Para instalar la PWA se necesita `localhost` o HTTPS.
- Postman es opcional, para ejecutar la colección incluida.

> El examen práctico solicita React 17 y Java 11. El documento de preparación
> menciona React 19 y Java 11 o superior; este proyecto sigue el examen
> práctico y exige Java 11.

React, React DOM y `react-is` están fijados en la versión 17.0.2. La resolución
de `react-is` se mantiene alineada con React mediante `overrides`, como requiere
Material UI 7 para identificar correctamente los elementos de React 17.

La versión predeterminada de la aplicación es `0.0.1`. Coincide con las
versiones declaradas del frontend y del backend y es independiente de las
versiones de React y Java.

```text
.
├── backend/
│   ├── Gapsi_Postman_Collection.json
│   ├── pom.xml
│   └── src/
└── frontend/
    ├── public/                 # Manifiesto, iconos y service worker
    ├── src/                    # Vistas, componentes, API y estado Redux
    └── package.json
```

## Patrones de diseño del backend

### 1. Builder, utilizado por un mapper Singleton

Los DTO de respuesta son inmutables: sus campos son `final` y Lombok genera
un **Builder** para construirlos de forma explícita, sin exponer las entidades
de persistencia. El componente `ApplicationMapper` concentra las conversiones
y, como `@Component` de Spring con el alcance predeterminado, existe una
instancia compartida por contexto de aplicación (Singleton de Spring).

- [ApplicationMapper.java](backend/src/main/java/com/gapsi/ecommerce/mapping/ApplicationMapper.java):
  crea los DTO mediante `builder()`.
- [ApplicationInfoDTO.java](backend/src/main/java/com/gapsi/ecommerce/dto/ApplicationInfoDTO.java)
  y [SupplierDTO.java](backend/src/main/java/com/gapsi/ecommerce/dto/SupplierDTO.java):
  definen los objetos de respuesta inmutables.

### 2. Strategy para validar proveedores

La interfaz `SupplierValidationStrategy` define el contrato de validación.
`UniqueNameValidationStrategy` lo implementa y comprueba la unicidad del
nombre, normalizando mayúsculas y minúsculas y los espacios reconocidos por
`Character.isWhitespace` o `Character.isSpaceChar` de Java. No se eliminan
todos los caracteres de espacio en blanco Unicode. `SupplierService` depende
de la interfaz y no de la implementación concreta, lo que permite sustituir o
extender la regla sin reescribir el servicio. Una restricción única en la base
también protege frente a creaciones simultáneas.

- [SupplierValidationStrategy.java](backend/src/main/java/com/gapsi/ecommerce/validation/SupplierValidationStrategy.java):
  contrato de la estrategia.
- [UniqueNameValidationStrategy.java](backend/src/main/java/com/gapsi/ecommerce/validation/UniqueNameValidationStrategy.java)
  y [SupplierNameNormalizer.java](backend/src/main/java/com/gapsi/ecommerce/validation/SupplierNameNormalizer.java):
  regla de unicidad y normalización.
- [SupplierService.java](backend/src/main/java/com/gapsi/ecommerce/service/SupplierService.java):
  invoca la estrategia antes de guardar.

## Clonar, compilar y ejecutar

### 1. Obtener el proyecto

```bash
git clone https://github.com/chrissierram-lab/ecommerce-supplier-portal.git
cd ecommerce-supplier-portal
```

Si ya tienes el proyecto, comienza desde su directorio raíz.

### 2. Iniciar el backend

En una terminal:

```bash
cd backend
# Selecciona tu JDK 11, por ejemplo:
export JAVA_HOME=/ruta/al/jdk-11
export PATH="$JAVA_HOME/bin:$PATH"
java -version
mvn -version
mvn clean verify
mvn spring-boot:run
```

Sustituye la ruta por la de tu JDK; tanto `java -version` como `mvn -version`
deben mostrar Java 11. Si usas SDKMAN, `sdk env install` dentro de `backend/`
instala y selecciona el JDK indicado en `.sdkmanrc`; en terminales posteriores,
`sdk env` lo selecciona. Maven y el JAR rechazan versiones distintas de Java 11.

La API estará disponible en `http://localhost:8080`. Por defecto se crean
35 proveedores de ejemplo. H2 se ejecuta en memoria: los cambios se pierden
cuando se detiene el backend. Para iniciar el JAR sin datos de ejemplo:

```bash
java -jar target/ecommerce-backend-0.0.1.jar --gapsi.seed.enabled=false
```

Con el perfil `dev` predeterminado están disponibles
[Swagger UI](http://localhost:8080/swagger-ui/index.html),
[GraphiQL](http://localhost:8080/graphiql) y la
[consola H2](http://localhost:8080/h2-console)
(`jdbc:h2:mem:gapsidb`, usuario `sa`, contraseña vacía). Estas herramientas
son solo para desarrollo.

### 3. Iniciar el frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
npm ci
npm run dev
```

Abre **http://localhost:5173**. El backend admite por defecto los orígenes
`http://localhost:5173` y `http://localhost:3000`; si usas otro origen,
ajusta `gapsi.cors.allowed-origins` en su configuración.

El frontend utiliza `http://localhost:8080` por defecto. Para apuntar a otro
backend antes de iniciar Vite o compilar:

```bash
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

Verificación y compilación:

```bash
npm test
npm run build
```

Para comprobar la compilación de producción con el origen CORS predeterminado,
detén el servidor de desarrollo y ejecuta:

```bash
npm run preview -- --port 5173 --strictPort
```

## Uso de la aplicación y PWA

La bienvenida y la versión se obtienen de `/api/info`. En **Continuar** se
abre la lista de proveedores: permite agregar, confirmar la eliminación e
imprimir la página actual. La tabla combina paginación de servidor de diez
registros con desplazamiento virtual en un contenedor de altura fija; al
imprimir se muestran todas las filas de la página seleccionada.

El encabezado utiliza el logotipo incluido en el PDF del examen. La imagen
predeterminada del candidato es una ilustración genérica; para personalizarla,
sustituye [candidate.png](frontend/public/assets/candidate.png) o cambia
`gapsi.app.candidate-image` en la configuración del backend. Una ruta relativa
como `/assets/candidate.png` se sirve desde `frontend/public`; también se
puede configurar una URL de imagen accesible desde el navegador. Si la imagen
no carga, la bienvenida muestra el logotipo de Gapsi como alternativa.

El [manifiesto](frontend/public/manifest.json) proporciona nombre, colores e
iconos de instalación. El [service worker](frontend/public/serviceWorker.js)
guarda la interfaz y los recursos de la compilación para poder reabrirla sin
conexión. **No guarda ni simula respuestas de la API**: las operaciones y los
datos actualizados requieren que el backend esté disponible; en caso contrario
la interfaz muestra el error y ofrece reintentar. Las hojas de estilo de los
CDN y las fuentes externas pueden no estar disponibles sin conexión.

Para instalarla, abre la aplicación compilada en `localhost` o HTTPS y utiliza
la opción **Instalar aplicación** del navegador compatible.

## API y colección Postman

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/info` | Mensaje de bienvenida, versión e imagen. |
| GET | `/api/suppliers?page=0&size=10` | Página de proveedores; el índice empieza en 0. |
| POST | `/api/suppliers` | Crear con `nombre`, `razonSocial` y `direccion`. |
| DELETE | `/api/suppliers/{id}` | Eliminar un proveedor. |
| POST | `/graphql` | Consultas y mutaciones GraphQL. |

Una creación correcta devuelve HTTP 201; un nombre duplicado devuelve HTTP 409
y un objeto con `error`. Las solicitudes inválidas devuelven 400 y un ID
inexistente devuelve 404. La API GraphQL comunica los errores de negocio en el
campo `errors` de la respuesta.

### Importar y probar con Postman

1. Inicia el backend en `http://localhost:8080`.
2. En Postman selecciona **Import** y elige
   [backend/Gapsi_Postman_Collection.json](backend/Gapsi_Postman_Collection.json).
3. En las variables de la colección verifica `baseUrl`
   (`http://localhost:8080`). `supplierId` comienza en `1`.
4. En la carpeta **REST**, ejecuta **Información** y **Listar proveedores**.
5. En **Crear proveedor**, `nombre` usa `{{$guid}}`, por lo que cada envío
   genera un nombre distinto. Para probar el conflicto, sustitúyelo por un
   nombre fijo que no exista, por ejemplo `Proveedor Postman Duplicado`, y
   envía la petición dos veces seguidas sin eliminarlo entre las solicitudes.
   La primera devuelve 201 y guarda el ID en `supplierId`; la segunda devuelve
   409 sin modificar esa variable.
6. Ejecuta **Eliminar proveedor** para borrar el proveedor creado.
7. En la carpeta **GraphQL**, ejecuta las peticiones de listar, crear y
   eliminar. La creación también actualiza `supplierId`. Revisa tanto `data`
   como `errors` en cada respuesta.

Más detalles del backend y sus opciones de configuración:
[backend/README.md](backend/README.md).


