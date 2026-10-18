
package br.com.saarprf.saarprf.controller;

import br.com.saarprf.saarprf.model.Acidente;
import br.com.saarprf.saarprf.service.AcidenteService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/acidentes")
public class AcidenteController {

    private final AcidenteService service;

    public AcidenteController(AcidenteService service) {
        this.service = service;
    }

    // GET - listar todos
    @GetMapping
    public ResponseEntity<List<Acidente>> listarTodos() {
        return ResponseEntity.ok(service.listarTodos());
    }

    // GET - buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Acidente> buscarPorId(
            @PathVariable Long id) {

        return service.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST - cadastrar
    @PostMapping
    public ResponseEntity<Acidente> cadastrar(
            @Valid @RequestBody Acidente acidente) {

        Acidente salvo = service.cadastrar(acidente);

        URI localizacao = URI.create(
                "/api/acidentes/" + salvo.getId()
        );

        return ResponseEntity.created(localizacao).body(salvo);
    }

    // PUT - atualizar
    @PutMapping("/{id}")
    public ResponseEntity<Acidente> atualizar(
            @PathVariable Long id,
            @RequestBody Acidente acidente) {

        return service.atualizar(id, acidente)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE - excluir
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(
            @PathVariable Long id) {

        if (service.excluir(id)) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }

    // GET - filtrar por UF e rodovia
    @GetMapping("/filtro")
    public ResponseEntity<List<Acidente>> filtrar(
            @RequestParam(required = false) String uf,
            @RequestParam(required = false) String rodovia) {

        return ResponseEntity.ok(service.filtrar(uf, rodovia));
    }
}
