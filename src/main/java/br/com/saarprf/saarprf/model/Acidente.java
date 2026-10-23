
package br.com.saarprf.saarprf.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "acidentes")
public class Acidente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private Long idPrf;

    @NotNull(message = "A data é obrigatória")
    private LocalDate dataOcorrencia;

    @NotNull(message = "O horário é obrigatório")
    private LocalTime horario;

    @NotBlank(message = "A UF é obrigatória")
    private String uf;

    @NotBlank(message = "O município é obrigatório")
    private String municipio;

    @NotBlank(message = "A rodovia é obrigatória")
    private String rodovia;

    @NotNull(message = "O quilômetro é obrigatório")
    @DecimalMin(value = "0.0", message = "O quilômetro não pode ser negativo")
    private BigDecimal quilometro;

    @NotBlank(message = "A causa do acidente é obrigatória")
    @Column(length = 500)
    private String causaAcidente;


    @NotBlank(message = "A classificação é obrigatória")
    private String classificacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdPrf() {
        return idPrf;
    }

    public void setIdPrf(Long idPrf) {
        this.idPrf = idPrf;
    }

    public LocalDate getDataOcorrencia() {
        return dataOcorrencia;
    }

    public void setDataOcorrencia(LocalDate dataOcorrencia) {
        this.dataOcorrencia = dataOcorrencia;
    }

    public LocalTime getHorario() {
        return horario;
    }

    public void setHorario(LocalTime horario) {
        this.horario = horario;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public String getRodovia() {
        return rodovia;
    }

    public void setRodovia(String rodovia) {
        this.rodovia = rodovia;
    }

    public BigDecimal getQuilometro() {
        return quilometro;
    }

    public void setQuilometro(BigDecimal quilometro) {
        this.quilometro = quilometro;
    }

    public String getCausaAcidente() {
        return causaAcidente;
    }

    public void setCausaAcidente(String causaAcidente) {
        this.causaAcidente = causaAcidente;
    }

    public String getClassificacao() {
        return classificacao;
    }

    public void setClassificacao(String classificacao) {
        this.classificacao = classificacao;
    }
}

