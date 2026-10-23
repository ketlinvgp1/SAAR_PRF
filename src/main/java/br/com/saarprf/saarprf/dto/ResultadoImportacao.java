package br.com.saarprf.saarprf.dto;

public record ResultadoImportacao(
        long linhasLidas,
        long importadas,
        long rejeitadas,
        long duplicadas,
        String mensagem
) {
}