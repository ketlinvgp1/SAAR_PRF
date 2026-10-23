
package br.com.saarprf.saarprf.service;

import br.com.saarprf.saarprf.dto.ResultadoImportacao;
import br.com.saarprf.saarprf.model.Acidente;
import br.com.saarprf.saarprf.repository.AcidenteRepository;

import jakarta.validation.Validator;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.io.Reader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AcidenteService {

    private final AcidenteRepository repository;
    private final Validator validator;

    public AcidenteService(AcidenteRepository repository,
                           Validator validator) {
        this.repository = repository;
        this.validator = validator;
    }

    // LISTAR
    public List<Acidente> listarTodos() {
        return repository.findAll();
    }

    // BUSCAR POR ID
    public Optional<Acidente> buscarPorId(Long id) {
        return repository.findById(id);
    }

    // CADASTRAR
    public Acidente cadastrar(Acidente acidente) {

        if (acidente.getId() != null) {
            throw new IllegalArgumentException(
                    "O ID é gerado automaticamente pelo sistema"
            );
        }

        if (acidente.getIdPrf() != null &&
                repository.existsByIdPrf(acidente.getIdPrf())) {
            throw new IllegalArgumentException(
                    "Já existe um acidente cadastrado com esse ID da PRF"
            );
        }

        return repository.save(acidente);
    }

    // ATUALIZAR
    public Optional<Acidente> atualizar(Long id, Acidente dados) {
        return repository.findById(id).map(acidente -> {

            acidente.setDataOcorrencia(dados.getDataOcorrencia());
            acidente.setHorario(dados.getHorario());
            acidente.setUf(dados.getUf());
            acidente.setMunicipio(dados.getMunicipio());
            acidente.setRodovia(dados.getRodovia());
            acidente.setQuilometro(dados.getQuilometro());
            acidente.setCausaAcidente(dados.getCausaAcidente());
            acidente.setClassificacao(dados.getClassificacao());

            return repository.save(acidente);
        });
    }

    // EXCLUIR
    public boolean excluir(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    // FILTRAR
    public List<Acidente> filtrar(String uf, String rodovia) {

        if (uf != null && rodovia != null) {
            return repository
                    .findByUfIgnoreCaseAndRodoviaIgnoreCase(uf, rodovia);
        }

        if (uf != null) {
            return repository.findByUfIgnoreCase(uf);
        }

        if (rodovia != null) {
            return repository.findByRodoviaIgnoreCase(rodovia);
        }

        return repository.findAll();
    }

    // IMPORTAR CSV
    public ResultadoImportacao importar(MultipartFile arquivo) {

        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio");
        }

        String nome = arquivo.getOriginalFilename();

        if (nome == null ||
                !nome.toLowerCase().endsWith(".csv")) {
            throw new IllegalArgumentException(
                    "O arquivo deve ser CSV"
            );
        }

        long lidas = 0;
        long importadas = 0;
        long rejeitadas = 0;
        long duplicadas = 0;

        Set<Long> ids = new HashSet<>(
                repository.buscarIdsPrf()
        );

        try (
                Reader leitor = new InputStreamReader(
                        arquivo.getInputStream(),
                        StandardCharsets.ISO_8859_1
                );

                CSVParser csv = CSVFormat.DEFAULT.builder()
                        .setDelimiter(';')
                        .setHeader()
                        .setSkipHeaderRecord(true)
                        .setIgnoreEmptyLines(true)
                        .get()
                        .parse(leitor)
        ) {

            // Verificar as colunas do arquivo
            String[] colunas = {
                    "id", "data_inversa", "horario",
                    "uf", "municipio", "br", "km",
                    "causa_acidente",
                    "classificacao_acidente"
            };

            for (String coluna : colunas) {
                if (!csv.getHeaderMap().containsKey(coluna)) {
                    throw new IllegalArgumentException(
                            "Coluna ausente: " + coluna
                    );
                }
            }

            // Percorrer o CSV
            for (CSVRecord linha : csv) {
                lidas++;

                try {
                    Acidente acidente = converter(linha);

                    if (ids.contains(acidente.getIdPrf())) {
                        duplicadas++;
                        continue;
                    }

                    // Validar a entidade
                    if (!validator.validate(acidente).isEmpty()) {
                        rejeitadas++;
                        continue;
                    }

                    repository.save(acidente);
                    ids.add(acidente.getIdPrf());
                    importadas++;

                } catch (IllegalArgumentException |
                         java.time.DateTimeException e) {
                    rejeitadas++;
                }
            }

        } catch (java.io.IOException e) {
            throw new IllegalArgumentException(
                    "Erro na leitura do CSV", e
            );
        }

        if (lidas == 0) {
            throw new IllegalArgumentException(
                    "O arquivo CSV não possui registros"
            );
        }


        return new ResultadoImportacao(
                lidas,
                importadas,
                rejeitadas,
                duplicadas,
                "Importação concluída"
        );
    }

    // CONVERTER UMA LINHA DO CSV
    private Acidente converter(CSVRecord linha) {

        if (!linha.isConsistent()) {
            throw new IllegalArgumentException(
                    "Linha com colunas incorretas"
            );
        }

        Acidente acidente = new Acidente();

        Long idPrf = Long.parseLong(
                linha.get("id").trim()
        );

        if (idPrf <= 0) {
            throw new IllegalArgumentException("ID inválido");
        }

        acidente.setIdPrf(idPrf);

        acidente.setDataOcorrencia(
                LocalDate.parse(linha.get("data_inversa").trim())
        );

        acidente.setHorario(
                LocalTime.parse(linha.get("horario").trim())
        );

        String uf = linha.get("uf").trim().toUpperCase();

        if (!uf.matches("AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|" +
                "PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO")) {
            throw new IllegalArgumentException("UF inválida");
        }

        acidente.setUf(uf);

        acidente.setMunicipio(
                texto(linha.get("municipio"), 255)
        );

        acidente.setRodovia(
                texto(linha.get("br"), 255)
        );

        BigDecimal km = new BigDecimal(
                linha.get("km").trim().replace(",", ".")
        );

        if (km.signum() < 0) {
            throw new IllegalArgumentException("KM inválido");
        }

        acidente.setQuilometro(km);

        acidente.setCausaAcidente(
                texto(linha.get("causa_acidente"), 500)
        );

        acidente.setClassificacao(
                texto(linha.get("classificacao_acidente"), 255)
        );

        return acidente;
    }

    // VALIDAR E PADRONIZAR TEXTOS
    private String texto(String valor, int tamanhoMaximo) {

        String resultado = valor.trim()
                .replaceAll("\\s+", " ");

        if (resultado.isEmpty() ||
                resultado.equalsIgnoreCase("NA") ||
                resultado.length() > tamanhoMaximo) {
            throw new IllegalArgumentException(
                    "Campo inválido"
            );
        }

        return resultado;
    }
}
