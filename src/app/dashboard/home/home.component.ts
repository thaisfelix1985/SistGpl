import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common';  // Importando DatePipe

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [DatePipe]  // Adicionando DatePipe no array de providers
})
export class HomeComponent {
  formulario: FormGroup;
  visibilidadeCampos: boolean[] = [true]; // Array que controla a visibilidade dos campos
  maxGruposCampos: number = 2; // Número máximo de grupos de campos visíveis
  camposAdicionados: number = 0; // Controle do número de campos já adicionados

  constructor(private fb: FormBuilder, private http: HttpClient, private datePipe: DatePipe) {
    this.formulario = this.fb.group({
      NumeroProcessoRio: ['', Validators.required],

      UG: ['', Validators.required],  // Agora UG é tratado como string

      NomeUnidade: ['', Validators.required],
      CNPJ: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      RazaoSocial: ['', Validators.required],
      NrNotaFiscal: ['', Validators.required],
      ValorBruto: ['', [Validators.required, Validators.min(0)]],
      DataEmissao: ['', Validators.required],
      COFINS: ['', Validators.required],
      CSLL: ['', Validators.required],
      ISS: ['', Validators.required],
      IR: ['', Validators.required],
      PIS: ['', Validators.required],
      INSS: ['', Validators.required],

      listEmpenho: this.fb.array([this.criarEmpenho()])
    });
  }

  // Função para criar um novo empenho no FormArray
  criarEmpenho(): FormGroup {
    return this.fb.group({
      NE: ['', Validators.required],
      FR: ['', Validators.required],
      NaturezaDespesa: ['', Validators.required],
      TipoPatrimonial: ['', Validators.required],
      ItemPatrimonial: ['', Validators.required]
    });
  }

  // Função para adicionar um novo empenho no FormArray
  adicionarEmpenho() {
    (this.formulario.get('listEmpenho') as FormArray).push(this.criarEmpenho());
    this.visibilidadeCampos.push(false); // Inicialmente o novo campo será oculto
  }

  // Função para mostrar mais campos ao clicar no botão
  mostrarMaisCampos() {
    if (this.camposAdicionados < this.maxGruposCampos) {
      this.camposAdicionados++; // Aumenta o contador de campos adicionados
      this.adicionarEmpenho(); // Adiciona o novo grupo de campos
      this.visibilidadeCampos[this.visibilidadeCampos.length - 1] = true; // Torna o novo campo visível
    }
  }

  removerCampos() {
  if (this.camposAdicionados > 0) {
    this.camposAdicionados--; // Diminui o contador de campos adicionados
    this.visibilidadeCampos.pop(); // Remove o último campo visível
  }
}


  // Função para formatar o CNPJ
  formatarCNPJ(cnpj: string): string {
    return cnpj.replace(/\D/g, '')  // Remove todos os caracteres não numéricos
               .replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');  // Aplica a formatação correta
  }

  // Função para enviar os dados para a API
  onSubmit() {
    if (this.formulario.valid) {
      // Formatação da data
      const formattedDataEmissao = this.datePipe.transform(this.formulario.get('DataEmissao')?.value, 'yyyy-MM-dd');
      this.formulario.patchValue({
        DataEmissao: formattedDataEmissao
      });

      // Convertendo os campos para string, incluindo 'UG'
      const dadosParaEnviar = this.formulario.value;

      // Garantindo que 'UG' seja tratado como string
      dadosParaEnviar.UG = String(dadosParaEnviar.UG);  // Garantir que UG seja string

      dadosParaEnviar.NumeroProcessoRio = String(dadosParaEnviar.NumeroProcessoRio);
      dadosParaEnviar.ValorBruto = String(dadosParaEnviar.ValorBruto);
      dadosParaEnviar.COFINS = String(dadosParaEnviar.COFINS);
      dadosParaEnviar.CSLL = String(dadosParaEnviar.CSLL);
      dadosParaEnviar.ISS = String(dadosParaEnviar.ISS);
      dadosParaEnviar.IR = String(dadosParaEnviar.IR);
      dadosParaEnviar.PIS = String(dadosParaEnviar.PIS);
      dadosParaEnviar.INSS = String(dadosParaEnviar.INSS);

      // Formatando o CNPJ
      dadosParaEnviar.CNPJ = this.formatarCNPJ(dadosParaEnviar.CNPJ);

      // Convertendo todos os itens do array listEmpenho para string também
      dadosParaEnviar.listEmpenho.forEach((item: any) => {
        item.NE = String(item.NE);
        item.FR = String(item.FR);
        item.NaturezaDespesa = String(item.NaturezaDespesa);
        item.TipoPatrimonial = String(item.TipoPatrimonial);
        item.ItemPatrimonial = String(item.ItemPatrimonial);
      });

      console.log("Dados que serão enviados para a API:", JSON.stringify(dadosParaEnviar, null, 2));

      // Configurando os cabeçalhos da requisição
      const headers = new HttpHeaders({
        'Content-Type': 'application/json'
      });

      // Enviar os dados para a API
      this.http.post('http://10.1.72.147:80/api-gpl/Api/Unidade/ProcessoCadastro', dadosParaEnviar, { headers })
        .subscribe({
          next: (response) => {
            console.log('Dados enviados com sucesso!', response);
          },
          error: (error) => {
            console.error('Erro ao enviar dados:', error);
          }
        });
    } else {
      // Mostrar erros de validação
      this.exibirErros();
    }
  }

  // Função para exibir quais campos estão inválidos
  exibirErros() {
    // Percorrendo todos os controles no formulário
    for (const controlName in this.formulario.controls) {
      const control = this.formulario.get(controlName);
      if (control && control.invalid) {
        console.log(`${controlName} está inválido.`);
      }
    }

    // Verificando os campos dentro do FormArray
    const listEmpenho = this.formulario.get('listEmpenho') as FormArray;
    if (listEmpenho) {
      listEmpenho.controls.forEach((control, index) => {
        if (control instanceof FormGroup) {
          for (const controlName in control.controls) {
            const nestedControl = control.get(controlName);
            if (nestedControl && nestedControl.invalid) {
              console.log(`Empenho ${index + 1}: ${controlName} está inválido.`);
            }
          }
        }
      });
    }
  }

  // Função para acessar os controles de listEmpenho de forma mais fácil
  get listEmpenho(): FormArray {
    return this.formulario.get('listEmpenho') as FormArray;
  }
}



