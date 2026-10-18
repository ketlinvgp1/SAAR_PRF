
package br.com.saarprf.saarprf.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class TratamentoErros {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<String>>> tratarValidacao(
            MethodArgumentNotValidException exception) {

        List<String> erros = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(erro -> erro.getDefaultMessage())
                .toList();

        return ResponseEntity.badRequest()
                .body(Map.of("erros", erros));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> tratarRegraNegocio(
            IllegalArgumentException exception) {

        return ResponseEntity.badRequest()
                .body(Map.of("erro", exception.getMessage()));
    }
}
