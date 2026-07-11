# citavel.ai

Site oficial da CITÁVEL™, agência de reputação de marcas em inteligências artificiais (Método PULSO™). Desigual IA Labs, Birigui, SP.

Site estático de propósito: crawlers de IA leem HTML sem rodar JavaScript, então todo o conteúdo (inclusive schema JSON-LD, llms.txt e sitemap) é servido pronto. O motion (GSAP) é camada progressiva: sem JS, o site continua 100% legível.

## Estrutura

- `index.html`: home (proposta de valor, Case #0, fórmula PULSO, preços, FAQ, form de diagnóstico)
- `metodo.html`: as 5 fases do Método PULSO (schema HowTo)
- `case.html`: Case #0, de zero a #1 no ChatGPT em 30 dias (schema Article)
- `sobre.html`: versão de referência para citação por IAs
- `llms.txt`, `robots.txt`, `sitemap.xml`: camada de leitura pra motores
- `styles.css`, `main.js`, `og.png`

## Deploy

GitHub Pages, branch `main`, raiz. Todo push na main publica automaticamente.

Preview local:

```bash
python3 -m http.server 8765
```

## Regras de edição

- Copy em português do Brasil, sem travessão.
- Preços e números do case só mudam com aprovação do Endrigo.
- Nunca inventar dado: os números reais do Case #0 e do case Cosentino bastam.
