
package br.com.saarprf.saarprf.repository;

import br.com.saarprf.saarprf.model.Acidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AcidenteRepository
        extends JpaRepository<Acidente, Long> {

    List<Acidente> findByUfIgnoreCase(String uf);

    List<Acidente> findByRodoviaIgnoreCase(String rodovia);

    List<Acidente> findByUfIgnoreCaseAndRodoviaIgnoreCase(
            String uf, String rodovia
    );

    boolean existsByIdPrf(Long idPrf);

    @Query("SELECT a.idPrf FROM Acidente a WHERE a.idPrf IS NOT NULL")
    List<Long> buscarIdsPrf();

}
