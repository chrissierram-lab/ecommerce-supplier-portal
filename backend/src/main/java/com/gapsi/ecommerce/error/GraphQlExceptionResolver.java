package com.gapsi.ecommerce.error;

import java.util.Collections;
import javax.validation.ConstraintViolationException;

import graphql.GraphQLError;
import graphql.GraphqlErrorBuilder;
import graphql.schema.DataFetchingEnvironment;
import org.springframework.graphql.execution.DataFetcherExceptionResolverAdapter;
import org.springframework.graphql.execution.ErrorType;
import org.springframework.stereotype.Component;

@Component
public class GraphQlExceptionResolver extends DataFetcherExceptionResolverAdapter {

    @Override
    protected GraphQLError resolveToSingleError(Throwable exception, DataFetchingEnvironment environment) {
        if (exception instanceof DuplicateSupplierException) {
            return error(environment, ErrorType.BAD_REQUEST, "CONFLICT", exception.getMessage());
        }
        if (exception instanceof SupplierNotFoundException) {
            return error(environment, ErrorType.NOT_FOUND, "NOT_FOUND", exception.getMessage());
        }
        if (exception instanceof InvalidRequestException) {
            return error(environment, ErrorType.BAD_REQUEST, "BAD_REQUEST", exception.getMessage());
        }
        if (exception instanceof ConstraintViolationException) {
            String message = ValidationErrorMessages.from((ConstraintViolationException) exception);
            return error(environment, ErrorType.BAD_REQUEST, "BAD_REQUEST", message);
        }
        return null;
    }

    private GraphQLError error(DataFetchingEnvironment environment, ErrorType type, String code, String message) {
        return GraphqlErrorBuilder.newError(environment)
                .errorType(type)
                .message(message)
                .extensions(Collections.singletonMap("code", code))
                .build();
    }
}
