const fs = require('fs');
let f = fs.readFileSync('public/index.html', 'utf8');

// Remove a página clientes fora do lugar
f = f.replace(/\n\n      <!-- CLIENTES -->\n      <div class="page" id="p-clientes">[\s\S]*?<\/div>\n\n<!-- MODAL ADD SELLER -->/, '\n\n<!-- MODAL ADD SELLER -->');

// Insere a página clientes no lugar certo (antes de VENDEDORES)
f = f.replace('<!-- VENDEDORES -->', `<!-- CLIENTES -->
      <div class="page" id="p-clientes">
        <div style="display:flex;justify-content:flex-end;margin-bottom:12px">
          <button class="btn btn-primary" onclick="openAddClient()"><i class="ti ti-user-plus" style="font-size:12px"></i> Novo Cliente</button>
        </div>
        <div class="card">
          <div class="card-head">
            <span class="card-title">Clientes cadastrados</span>
            <div class="card-actions">
              <div class="sbox"><i class="ti ti-search"></i><input placeholder="Buscar cliente..." oninput="filterClients(this.value)"></div>
            </div>
          </div>
          <div id="client-list"></div>
        </div>
      </div>

      <!-- VENDEDORES -->`);

fs.writeFileSync('public/index.html', f);
console.log('OK');
console.log('Verificando p-clientes:', f.includes('id="p-clientes"') ? 'ENCONTRADO' : 'NÃO ENCONTRADO');