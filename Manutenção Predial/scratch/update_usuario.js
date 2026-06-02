const fs = require('fs');
let code = fs.readFileSync('src/Models/Usuario.php', 'utf8');

code = code.replace(
    'private ?string $data_criacao = null;',
    'private ?string $data_criacao = null;\n    private array $ambientes_vinculados = [];'
);

code = code.replace(
    '        ?int $id = null,\n        ?string $data_criacao = null',
    '        ?int $id = null,\n        ?string $data_criacao = null,\n        array $ambientes_vinculados = []'
);

code = code.replace(
    '        $this->data_criacao = $data_criacao;',
    '        $this->data_criacao = $data_criacao;\n        $this->ambientes_vinculados = $ambientes_vinculados;'
);

code = code.replace(
    '    public function getDataCriacao(): ?string { return $this->data_criacao; }',
    '    public function getDataCriacao(): ?string { return $this->data_criacao; }\n    public function getAmbientesVinculados(): array { return $this->ambientes_vinculados; }\n    public function setAmbientesVinculados(array $ambientes): void { $this->ambientes_vinculados = $ambientes; }'
);

const oldNewSelf = `return new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao']
            );`;
const newNewSelf = `return new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : []
            );`;

code = code.split(oldNewSelf).join(newNewSelf);

const oldArrSelf = `$usuarios[] = new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao']
            );`;
const newArrSelf = `$usuarios[] = new self(
                $row['nome'],
                $row['email'],
                $row['senha'],
                $row['nivel_acesso'],
                (int)$row['id'],
                $row['data_criacao'],
                isset($row['ambientes_vinculados']) ? (json_decode($row['ambientes_vinculados'], true) ?: []) : []
            );`;

code = code.split(oldArrSelf).join(newArrSelf);

code = code.replace(
    `$sql = "INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES (:nome, :email, :senha, :nivel_acesso)";`,
    `$sql = "INSERT INTO usuarios (nome, email, senha, nivel_acesso, ambientes_vinculados) VALUES (:nome, :email, :senha, :nivel_acesso, :ambientes_vinculados)";`
);
code = code.replace(
    `                'nivel_acesso' => $this->nivel_acesso`,
    `                'nivel_acesso' => $this->nivel_acesso,\n                'ambientes_vinculados' => json_encode($this->ambientes_vinculados)`
);

code = code.replace(
    `$sql = "UPDATE usuarios SET nome = :nome, email = :email, nivel_acesso = :nivel_acesso WHERE id = :id";`,
    `$sql = "UPDATE usuarios SET nome = :nome, email = :email, nivel_acesso = :nivel_acesso, ambientes_vinculados = :ambientes_vinculados WHERE id = :id";`
);
code = code.replace(
    `                'nivel_acesso' => $this->nivel_acesso,`,
    `                'nivel_acesso' => $this->nivel_acesso,\n                'ambientes_vinculados' => json_encode($this->ambientes_vinculados),`
);

fs.writeFileSync('src/Models/Usuario.php', code);
console.log('Usuario.php updated');
