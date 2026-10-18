
package br.com.saarprf.saarprf.service;

import br.com.saarprf.saarprf.model.Acidente;
import br.com.saarprf.saarprf.repository.AcidenteRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AcidenteService {

    private final AcidenteRepository repository;

    public AcidenteService(AcidenteRepository repository) {
        this.repository = repository;
    }

    public List<Acidente> listarTodos() {
        return repository.findAll();
    }

    public Optional<Acidente> buscarPorId(Long id) {
        return repository.findById(id);
    }


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

    public boolean excluir(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }

        repository.deleteById(id);
        return true;
    }

    public List<Acidente> filtrar(String uf, String rodovia) {
        if (uf != null && rodovia != null) {
            return repository.findByUfIgnoreCaseAndRodoviaIgnoreCase(uf, rodovia);
        }

        if (uf != null) {
            return repository.findByUfIgnoreCase(uf);
        }

        if (rodovia != null) {
            return repository.findByRodoviaIgnoreCase(rodovia);
        }

        return repository.findAll();
    }
}
